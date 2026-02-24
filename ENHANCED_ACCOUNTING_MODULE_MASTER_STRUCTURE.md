
# 📘 ACCOUNTING MODULE (MASTER SECTION STRUCTURE)
## (Enhanced Developer Technical Specification + AI Prompt Template)

---

# 1. Module Positioning in System

The Accounting Module is designed as a **Master Section** within the system.

It contains structured sub-modules:

1. Account Module (CRUD)
2. Income Module
3. Expense Module
4. Ledger / Financial Reports

This document enhances and restructures the previous version to clearly define:

- Master hierarchy
- Tab-based UI structure
- Required fields
- Required validations
- Required reports
- Operational flow

---

# 2. MASTER STRUCTURE HIERARCHY

Accounting (Main Master Section)

├── Account Module (CRUD)  
├── Income Module  
│     ├── Incomes (Tab 1 – Transactions)  
│     └── Income Category (Tab 2 – Master)  
├── Expense Module  
│     ├── Expenses (Tab 1 – Transactions)  
│     └── Expense Category (Tab 2 – Master)  
└── Ledger / Reports  

---

# 3. ACCOUNT MODULE (CRUD)

## 3.1 Purpose

Manage financial storage accounts where money is stored and transacted.

Examples:
- Cash
- Bank
- UPI
- Wallet

Supports multi-account structure.

---

## 3.2 Fields

- id
- account_name (Required)
- opening_balance (Required)
- notes
- is_default (Only one allowed)
- status (active / inactive)
- created_at
- updated_at

---

## 3.3 Required Rules

- Only one account can be default.
- Inactive account cannot be used in transactions.
- Prevent deletion if linked with income/expense.
- Opening balance must be numeric.

---

## 3.4 Account List View (UI)

Columns:

- Account Name
- Opening Balance
- Current Balance (Calculated)
- Status
- Action (Edit / Delete)

Filters:

- Status
- Search by name

---

# 4. INCOME MODULE

This module must contain **two tab sections**.

---

## 4.1 Tab 1: Incomes (Transactions – CRUD)

### Required Fields

- income_date (Required)
- account_id (Required)
- income_category_id (Required)
- amount (Required)
- remarks

Validation:

- Account is mandatory
- Amount must be greater than 0
- Account must be active

---

### Income List View (UI)

Columns:

- Date
- Account
- Category
- Amount
- Remarks
- Created By
- Actions (Edit / Delete)

Filters:

- Date Range (Mandatory filter option)
- Account
- Category
- Created By

---

### Balance Logic

On Create:
Account Balance += Amount

On Update:
Adjust difference

On Delete:
Account Balance -= Amount

---

## 4.2 Tab 2: Income Category (Master – CRUD)

Fields:

- id
- name (Required)
- description
- status
- created_at
- updated_at

Rules:

- Cannot delete if linked to income.
- Only active categories appear in income form dropdown.

List View:

- Name
- Description
- Status
- Actions

---

# 5. EXPENSE MODULE

This module must also contain **two tab sections**.

---

## 5.1 Tab 1: Expenses (Transactions – CRUD)

### Required Fields

- expense_date (Required)
- account_id (Required)
- expense_category_id (Required)
- amount (Required)
- remarks

Validation:

- Account is mandatory
- Amount must be greater than 0
- Account must be active

---

### Expense List View (UI)

Columns:

- Date
- Account
- Category
- Amount
- Remarks
- Created By
- Actions (Edit / Delete)

Filters:

- Date Range
- Account
- Category
- Created By

---

### Balance Logic

On Create:
Account Balance -= Amount

On Update:
Adjust difference

On Delete:
Account Balance += Amount

---

## 5.2 Tab 2: Expense Category (Master – CRUD)

Fields:

- id
- name (Required)
- description
- status
- created_at
- updated_at

Rules:

- Cannot delete if linked to expense.
- Only active categories appear in expense form dropdown.

---

# 6. LEDGER / FINANCIAL REPORTS SECTION

This section provides financial visibility.

---

## 6.1 Account Ledger Report

Shows:

- Opening Balance
- All income entries
- All expense entries
- Running balance
- Closing balance

Filters:

- Date Range (Required)
- Account

---

## 6.2 Income Summary Report

Grouped by:

- Category
- Date Range
- Account

---

## 6.3 Expense Summary Report

Grouped by:

- Category
- Date Range
- Account

---

## 6.4 Monthly Financial Summary

Displays:

- Total Income
- Total Expense
- Net Profit / Loss

Net Profit = Total Income - Total Expense

---

# 7. EXPORT REQUIREMENTS

All list views and reports must support:

- PDF Export
- Excel Export
- CSV Export

Export must respect applied filters.

---

# 8. SYSTEM VALIDATIONS

- Amount must be positive.
- Date is mandatory.
- Account is mandatory.
- Category must be active.
- Account must be active.
- Prevent deletion if linked with transactions.

---

# 9. PERFORMANCE REQUIREMENTS

- Pagination required for list views.
- Indexed filtering on date and account.
- Running balance must maintain data integrity.
- Handle high transaction volume safely.

---

# 10. AI IMPLEMENTATION PROMPT TEMPLATE

PROMPT START

Create an Accounting Master Module structured as:

1. Account Module (CRUD)
2. Income Module with 2 Tabs:
   - Incomes (Transactions CRUD)
   - Income Category (CRUD)
3. Expense Module with 2 Tabs:
   - Expenses (Transactions CRUD)
   - Expense Category (CRUD)
4. Ledger & Financial Reports section

Requirements:

- Account and Amount mandatory in transactions
- Auto balance calculation
- Date range filtering
- Export support (PDF, Excel, CSV)
- Running ledger report
- Pagination and optimized queries

Generate:

- Data models
- Service logic
- API endpoints
- Reporting queries
- Balance update logic
- Validation rules

Ensure scalable, production-ready implementation.

PROMPT END

---

# FINAL SUMMARY

This enhanced Accounting Module defines:

- Master-based structured hierarchy
- Tab-based Income & Expense UI
- Clear validation rules
- Ledger & report generation
- Required exports
- Safe balance logic
- Enterprise-ready structure

This document supersedes and enhances the previous Accounting specification.
