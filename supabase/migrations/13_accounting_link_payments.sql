-- Migration 13: Link Vendor & Staff payments into Accounting Expense view
-- Adds source tracking to expense_transactions for unified ledger

-- Add optional source link columns to expense_transactions
ALTER TABLE expense_transactions
  ADD COLUMN IF NOT EXISTS vendor_payment_id UUID REFERENCES vendor_payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS staff_payment_id  UUID REFERENCES staff_payments(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'vendor_payment', 'staff_payment'));

-- Index for source type filtering
CREATE INDEX IF NOT EXISTS idx_expense_transactions_source ON expense_transactions(source);
CREATE INDEX IF NOT EXISTS idx_expense_transactions_vendor_payment ON expense_transactions(vendor_payment_id);
CREATE INDEX IF NOT EXISTS idx_expense_transactions_staff_payment  ON expense_transactions(staff_payment_id);
