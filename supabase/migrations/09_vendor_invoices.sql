-- vendor_invoices: stores saved invoices for vendors
CREATE TABLE IF NOT EXISTS vendor_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,           -- e.g. INV-CF1CC3F2
  client_name text,
  note text,
  job_ids uuid[] NOT NULL DEFAULT '{}',  -- array of job UUIDs included in this invoice
  total_amount numeric NOT NULL DEFAULT 0,
  total_commission numeric NOT NULL DEFAULT 0,
  net_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON vendor_invoices
  FOR ALL USING (auth.role() = 'authenticated');
