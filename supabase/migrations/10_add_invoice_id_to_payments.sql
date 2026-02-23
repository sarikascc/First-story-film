-- Add invoice_id column to vendor_payments to link payments with invoices
-- This enables accurate Payment Status calculation per job

ALTER TABLE vendor_payments
ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES vendor_invoices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS vendor_payments_invoice_id_idx ON vendor_payments(invoice_id);
