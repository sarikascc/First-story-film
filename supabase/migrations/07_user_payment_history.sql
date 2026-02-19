CREATE TABLE staff_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by staff
CREATE INDEX idx_staff_payments_staff_id ON staff_payments(staff_id);

-- Enable Row Level Security
ALTER TABLE staff_payments ENABLE ROW LEVEL SECURITY;

-- Allow full access to authenticated users (admins)
CREATE POLICY "Allow all for authenticated"
  ON staff_payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);