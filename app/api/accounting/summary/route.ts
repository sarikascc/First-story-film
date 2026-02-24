import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

async function verifyAuth(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) return { error: "Unauthorized", status: 401 };
  const supabaseAdmin = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: "Invalid Session", status: 401 };
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!["ADMIN", "MANAGER"].includes(profile?.role))
    return { error: "Forbidden", status: 403 };
  return { user, supabaseAdmin };
}

// GET summary: account balances, total income, total expense, net profit
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if ("error" in auth)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { supabaseAdmin } = auth;
    const { searchParams } = new URL(request.url);

    const accountId = searchParams.get("account_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    // Fetch accounts
    const { data: accounts } = await supabaseAdmin
      .from("accounts")
      .select("id, account_name, opening_balance, status, is_default")
      .order("is_default", { ascending: false });

    // Income query
    let incomeQuery = supabaseAdmin
      .from("income_transactions")
      .select("amount, account_id, income_date");
    if (accountId) incomeQuery = incomeQuery.eq("account_id", accountId);
    if (dateFrom) incomeQuery = incomeQuery.gte("income_date", dateFrom);
    if (dateTo) incomeQuery = incomeQuery.lte("income_date", dateTo);
    const { data: incomeData } = await incomeQuery;

    // Vendor payments query (counted as income)
    let vpQuery = supabaseAdmin
      .from("vendor_payments")
      .select("amount, payment_date");
    if (dateFrom) vpQuery = vpQuery.gte("payment_date", dateFrom);
    if (dateTo) vpQuery = vpQuery.lte("payment_date", dateTo);
    // Vendor payments are not tied to an account, so skip accountId filter
    const { data: vendorPaymentsData } = accountId
      ? { data: [] as any[] }
      : await vpQuery;

    // Expense query
    let expenseQuery = supabaseAdmin
      .from("expense_transactions")
      .select("amount, account_id, expense_date");
    if (accountId) expenseQuery = expenseQuery.eq("account_id", accountId);
    if (dateFrom) expenseQuery = expenseQuery.gte("expense_date", dateFrom);
    if (dateTo) expenseQuery = expenseQuery.lte("expense_date", dateTo);
    const { data: expenseData } = await expenseQuery;

    // Income by category
    let incomeByCatQuery = supabaseAdmin
      .from("income_transactions")
      .select("amount, income_category_id, income_categories(name)");
    if (accountId)
      incomeByCatQuery = incomeByCatQuery.eq("account_id", accountId);
    if (dateFrom)
      incomeByCatQuery = incomeByCatQuery.gte("income_date", dateFrom);
    if (dateTo) incomeByCatQuery = incomeByCatQuery.lte("income_date", dateTo);
    const { data: incomeByCatData } = await incomeByCatQuery;

    // Expense by category
    let expenseByCatQuery = supabaseAdmin
      .from("expense_transactions")
      .select("amount, expense_category_id, expense_categories(name)");
    if (accountId)
      expenseByCatQuery = expenseByCatQuery.eq("account_id", accountId);
    if (dateFrom)
      expenseByCatQuery = expenseByCatQuery.gte("expense_date", dateFrom);
    if (dateTo)
      expenseByCatQuery = expenseByCatQuery.lte("expense_date", dateTo);
    const { data: expenseByCatData } = await expenseByCatQuery;

    // Calculate totals
    const totalManualIncome = (incomeData || []).reduce(
      (s: number, t: any) => s + Number(t.amount),
      0,
    );
    const totalVendorIncome = (vendorPaymentsData || []).reduce(
      (s: number, t: any) => s + Number(t.amount),
      0,
    );
    const totalIncome = totalManualIncome + totalVendorIncome;
    const totalExpense = (expenseData || []).reduce(
      (s: number, t: any) => s + Number(t.amount),
      0,
    );
    const netProfit = totalIncome - totalExpense;

    // Account balances: opening + income - expense
    const accountBalances = (accounts || []).map((acc: any) => {
      const accIncome = (incomeData || [])
        .filter((t: any) => t.account_id === acc.id)
        .reduce((s: number, t: any) => s + Number(t.amount), 0);
      const accExpense = (expenseData || [])
        .filter((t: any) => t.account_id === acc.id)
        .reduce((s: number, t: any) => s + Number(t.amount), 0);
      // For filtered view, use only transaction sum; for no filter, add opening balance
      const balance =
        !dateFrom && !dateTo
          ? Number(acc.opening_balance) + accIncome - accExpense
          : accIncome - accExpense;
      return {
        ...acc,
        current_balance: balance,
        income: accIncome,
        expense: accExpense,
      };
    });

    // Income by category summary
    const incomeByCategoryMap: Record<
      string,
      { name: string; amount: number }
    > = {};
    (incomeByCatData || []).forEach((t: any) => {
      const catId = t.income_category_id;
      const catName = t.income_categories?.name || "Unknown";
      if (!incomeByCategoryMap[catId])
        incomeByCategoryMap[catId] = { name: catName, amount: 0 };
      incomeByCategoryMap[catId].amount += Number(t.amount);
    });
    // Add vendor payments as a synthetic income category
    if (totalVendorIncome > 0) {
      incomeByCategoryMap["__vendor_payment__"] = {
        name: "Vendor Payment",
        amount: totalVendorIncome,
      };
    }

    // Expense by category summary
    const expenseByCategoryMap: Record<
      string,
      { name: string; amount: number }
    > = {};
    (expenseByCatData || []).forEach((t: any) => {
      const catId = t.expense_category_id;
      const catName = t.expense_categories?.name || "Unknown";
      if (!expenseByCategoryMap[catId])
        expenseByCategoryMap[catId] = { name: catName, amount: 0 };
      expenseByCategoryMap[catId].amount += Number(t.amount);
    });

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netProfit,
      accountBalances,
      incomeByCategory: Object.values(incomeByCategoryMap).sort(
        (a, b) => b.amount - a.amount,
      ),
      expenseByCategory: Object.values(expenseByCategoryMap).sort(
        (a, b) => b.amount - a.amount,
      ),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
