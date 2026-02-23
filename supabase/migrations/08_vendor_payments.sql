CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Optional: Enable RLS like other tables
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON vendor_payments
  FOR ALL USING (auth.role() = 'authenticated');