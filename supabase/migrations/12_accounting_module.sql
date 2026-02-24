-- =====================================================
-- ACCOUNTING MODULE
-- Migration 12: Accounts, Income & Expense Tracking
-- =====================================================

-- 1. ACCOUNTS TABLE (Master - Multi-Account Support)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name TEXT NOT NULL,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default account at a time (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_single_default
  ON accounts (is_default)
  WHERE is_default = true;

-- 2. INCOME CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS income_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXPENSE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INCOME TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS income_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  income_category_id UUID NOT NULL REFERENCES income_categories(id) ON DELETE RESTRICT,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  remarks TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPENSE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS expense_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  expense_category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  remarks TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_income_transactions_date ON income_transactions(income_date);
CREATE INDEX IF NOT EXISTS idx_income_transactions_account ON income_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_income_transactions_category ON income_transactions(income_category_id);
CREATE INDEX IF NOT EXISTS idx_income_transactions_created_by ON income_transactions(created_by);

CREATE INDEX IF NOT EXISTS idx_expense_transactions_date ON expense_transactions(expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_transactions_account ON expense_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_expense_transactions_category ON expense_transactions(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_expense_transactions_created_by ON expense_transactions(created_by);

-- =====================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_income_categories_updated_at ON income_categories;
CREATE TRIGGER update_income_categories_updated_at
  BEFORE UPDATE ON income_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expense_categories_updated_at ON expense_categories;
CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_income_transactions_updated_at ON income_transactions;
CREATE TRIGGER update_income_transactions_updated_at
  BEFORE UPDATE ON income_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expense_transactions_updated_at ON expense_transactions;
CREATE TRIGGER update_expense_transactions_updated_at
  BEFORE UPDATE ON expense_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_transactions ENABLE ROW LEVEL SECURITY;

-- Accounts: Admin & Manager manage
DROP POLICY IF EXISTS "Accounts: Admin Manage" ON accounts;
CREATE POLICY "Accounts: Admin Manage" ON accounts FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Accounts: View Authenticated" ON accounts;
CREATE POLICY "Accounts: View Authenticated" ON accounts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Income Categories: Admin Manage
DROP POLICY IF EXISTS "Income Categories: Admin Manage" ON income_categories;
CREATE POLICY "Income Categories: Admin Manage" ON income_categories FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Income Categories: View Authenticated" ON income_categories;
CREATE POLICY "Income Categories: View Authenticated" ON income_categories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Expense Categories: Admin Manage
DROP POLICY IF EXISTS "Expense Categories: Admin Manage" ON expense_categories;
CREATE POLICY "Expense Categories: Admin Manage" ON expense_categories FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Expense Categories: View Authenticated" ON expense_categories;
CREATE POLICY "Expense Categories: View Authenticated" ON expense_categories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Income Transactions: Admin Manage
DROP POLICY IF EXISTS "Income Transactions: Admin Manage" ON income_transactions;
CREATE POLICY "Income Transactions: Admin Manage" ON income_transactions FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Income Transactions: View Authenticated" ON income_transactions;
CREATE POLICY "Income Transactions: View Authenticated" ON income_transactions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Expense Transactions: Admin Manage
DROP POLICY IF EXISTS "Expense Transactions: Admin Manage" ON expense_transactions;
CREATE POLICY "Expense Transactions: Admin Manage" ON expense_transactions FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Expense Transactions: View Authenticated" ON expense_transactions;
CREATE POLICY "Expense Transactions: View Authenticated" ON expense_transactions FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- SEED DEFAULT DATA
-- =====================================================

-- Default Income Categories
INSERT INTO income_categories (name, description) VALUES
  ('Job Payment', 'Payments received from clients for jobs'),
  ('Advance Payment', 'Advance received from clients'),
  ('Other Income', 'Miscellaneous income')
ON CONFLICT (name) DO NOTHING;

-- Default Expense Categories
INSERT INTO expense_categories (name, description) VALUES
  ('Office Supplies', 'Stationery and office consumables'),
  ('Equipment', 'Camera, lighting and other equipment'),
  ('Travel', 'Transport and travel expenses'),
  ('Vendor Payment', 'Payments made to vendors/studios'),
  ('Salary', 'Staff salary and wages'),
  ('Utilities', 'Electricity, internet, phone bills'),
  ('Marketing', 'Advertising and promotional expenses'),
  ('Other Expense', 'Miscellaneous expenses')
ON CONFLICT (name) DO NOTHING;
