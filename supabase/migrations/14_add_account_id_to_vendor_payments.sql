-- Migration 14: Add account_id to vendor_payments
-- Links each vendor payment to a specific account (e.g. cash, bank)

ALTER TABLE vendor_payments
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
