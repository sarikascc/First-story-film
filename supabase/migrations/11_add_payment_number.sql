-- Add payment_number column to vendor_payments
ALTER TABLE vendor_payments
ADD COLUMN IF NOT EXISTS payment_number text;

CREATE INDEX IF NOT EXISTS vendor_payments_payment_number_idx ON vendor_payments(payment_number);
