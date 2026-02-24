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

// GET /api/accounting/expenses-all
// Returns merged view: manual expense_transactions + vendor_payments + staff_payments
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if ("error" in auth)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { supabaseAdmin } = auth;
    const { searchParams } = new URL(request.url);

    const accountId = searchParams.get("account_id");
    const categoryId = searchParams.get("category_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const sourceFilter = searchParams.get("source"); // 'manual' | 'vendor_payment' | 'staff_payment' | ''
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // ── 1. Manual expense transactions ──────────────────────────────────────
    let expQ = supabaseAdmin.from("expense_transactions").select(
      `
        id, expense_date, amount, remarks, source,
        account_id,
        accounts(id, account_name),
        expense_categories(id, name),
        users(id, name)
      `,
      { count: "exact" },
    );

    if (accountId) expQ = expQ.eq("account_id", accountId);
    if (categoryId) expQ = expQ.eq("expense_category_id", categoryId);
    if (dateFrom) expQ = expQ.gte("expense_date", dateFrom);
    if (dateTo) expQ = expQ.lte("expense_date", dateTo);
    // Only filter by source if it's 'manual' or no filter — vendor/staff rows come from their own tables
    if (sourceFilter === "manual") expQ = expQ.eq("source", "manual");

    const { data: manualTxs, error: expError } = await expQ
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (expError)
      console.error("[expenses-all] manual query error:", expError.message);

    // ── 2. Vendor payments (read-only) ──────────────────────────────────────
    let vpQ = supabaseAdmin
      .from("vendor_payments")
      .select(
        `id, payment_date, amount, note, vendor_id, vendors(id, studio_name)`,
      );
    if (dateFrom) vpQ = vpQ.gte("payment_date", dateFrom);
    if (dateTo) vpQ = vpQ.lte("payment_date", dateTo);
    const { data: vendorPayments, error: vpError } = await vpQ.order(
      "payment_date",
      { ascending: false },
    );
    if (vpError)
      console.error(
        "[expenses-all] vendor_payments query error:",
        vpError.message,
      );

    // ── 3. Staff payments (read-only) ───────────────────────────────────────
    let spQ = supabaseAdmin
      .from("staff_payments")
      .select(`id, payment_date, amount, note, staff_id, users(id, name)`);
    if (dateFrom) spQ = spQ.gte("payment_date", dateFrom);
    if (dateTo) spQ = spQ.lte("payment_date", dateTo);
    const { data: staffPayments } = await spQ.order("payment_date", {
      ascending: false,
    });

    // Also exclude manual entries if filter is vendor_payment or staff_payment
    const filteredManual =
      sourceFilter && sourceFilter !== "manual" ? [] : manualTxs || [];

    const manualRows = filteredManual.map((t: any) => ({
      id: t.id,
      date: t.expense_date,
      amount: Number(t.amount),
      remarks: t.remarks || "",
      source: t.source || "manual",
      account: t.accounts?.account_name || "—",
      account_id: t.account_id,
      category: t.expense_categories?.name || "—",
      created_by: t.users?.name || "—",
      ref_name: "",
      deletable: true,
      editable: false,
    }));

    const vendorRows =
      sourceFilter && sourceFilter !== "vendor_payment"
        ? []
        : (vendorPayments || []).map((p: any) => ({
            id: p.id,
            date: p.payment_date,
            amount: Number(p.amount),
            remarks: p.note || "",
            source: "vendor_payment",
            account: "—",
            account_id: null,
            category: "Vendor Payment",
            created_by: "—",
            ref_name: (p.vendors as any)?.studio_name || "—",
            deletable: false,
            editable: false,
          }));

    const staffRows =
      sourceFilter && sourceFilter !== "staff_payment"
        ? []
        : (staffPayments || []).map((p: any) => ({
            id: p.id,
            date: p.payment_date,
            amount: Number(p.amount),
            remarks: p.note || "",
            source: "staff_payment",
            account: "—",
            account_id: null,
            category: "Staff Payment",
            created_by: "—",
            ref_name: (p.users as any)?.name || "—",
            ref_sub: "",
            deletable: false,
            editable: false,
          }));

    // Merge all, sort by date descending
    const allRows = [...manualRows, ...vendorRows, ...staffRows].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    // Paginate
    const total = allRows.length;
    const start = (page - 1) * limit;
    const paged = allRows.slice(start, start + limit);

    return NextResponse.json({ data: paged, count: total, page, limit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
