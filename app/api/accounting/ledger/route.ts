import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

async function verifyAuth(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) return { error: 'Unauthorized', status: 401 }
  const supabaseAdmin = getSupabaseAdmin()
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return { error: 'Invalid Session', status: 401 }
  const { data: profile } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
  if (!['ADMIN', 'MANAGER'].includes(profile?.role)) return { error: 'Forbidden', status: 403 }
  return { user, supabaseAdmin }
}

// GET /api/accounting/ledger?account_id=...&date_from=...&date_to=...
// Returns per-account running balance ledger
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { supabaseAdmin } = auth
    const { searchParams } = new URL(request.url)

    const accountId = searchParams.get('account_id')
    if (!accountId) return NextResponse.json({ error: 'account_id is required' }, { status: 400 })

    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Fetch account info
    const { data: account, error: accErr } = await supabaseAdmin
      .from('accounts')
      .select('id, account_name, opening_balance, status, is_default')
      .eq('id', accountId)
      .single()

    if (accErr || !account) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    // Calculate opening balance at start of date range:
    // opening_balance + all transactions BEFORE date_from
    let openingBalance = Number(account.opening_balance)

    if (dateFrom) {
      const [prevInc, prevExp] = await Promise.all([
        supabaseAdmin
          .from('income_transactions')
          .select('amount')
          .eq('account_id', accountId)
          .lt('income_date', dateFrom),
        supabaseAdmin
          .from('expense_transactions')
          .select('amount')
          .eq('account_id', accountId)
          .lt('expense_date', dateFrom),
      ])
      const prevIncTotal = (prevInc.data || []).reduce((s: number, t: any) => s + Number(t.amount), 0)
      const prevExpTotal = (prevExp.data || []).reduce((s: number, t: any) => s + Number(t.amount), 0)
      openingBalance = openingBalance + prevIncTotal - prevExpTotal
    }

    // Fetch income transactions in range
    let incomeQuery = supabaseAdmin
      .from('income_transactions')
      .select('id, income_date, amount, remarks, income_categories(name), users(name), created_at')
      .eq('account_id', accountId)
    if (dateFrom) incomeQuery = incomeQuery.gte('income_date', dateFrom)
    if (dateTo) incomeQuery = incomeQuery.lte('income_date', dateTo)
    const { data: incomeData } = await incomeQuery

    // Fetch expense transactions in range
    let expenseQuery = supabaseAdmin
      .from('expense_transactions')
      .select('id, expense_date, amount, remarks, expense_categories(name), users(name), created_at')
      .eq('account_id', accountId)
    if (dateFrom) expenseQuery = expenseQuery.gte('expense_date', dateFrom)
    if (dateTo) expenseQuery = expenseQuery.lte('expense_date', dateTo)
    const { data: expenseData } = await expenseQuery

    // Merge & sort by date then created_at
    const entries = [
      ...(incomeData || []).map((t: any) => ({
        id: t.id,
        date: t.income_date,
        type: 'income' as const,
        category: t.income_categories?.name || '—',
        remarks: t.remarks || '',
        credit: Number(t.amount),
        debit: 0,
        createdBy: t.users?.name || '—',
        created_at: t.created_at,
      })),
      ...(expenseData || []).map((t: any) => ({
        id: t.id,
        date: t.expense_date,
        type: 'expense' as const,
        category: t.expense_categories?.name || '—',
        remarks: t.remarks || '',
        credit: 0,
        debit: Number(t.amount),
        createdBy: t.users?.name || '—',
        created_at: t.created_at,
      })),
    ].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.created_at.localeCompare(b.created_at)
    })

    // Calculate running balance per row
    let runningBalance = openingBalance
    const transactions = entries.map(e => {
      runningBalance = runningBalance + e.credit - e.debit
      return { ...e, balance: runningBalance }
    })

    return NextResponse.json({
      account,
      openingBalance,
      transactions,
      closingBalance: runningBalance,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
