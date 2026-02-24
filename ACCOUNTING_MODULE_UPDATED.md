# 📘 Accounting Module

## (Developer Technical Specification + AI Prompt Template - Updated Version)

------------------------------------------------------------------------

# 1. Module Overview

The **Accounting Module** is a reusable, platform-independent financial
tracking component designed to manage:

-   Account Master (Multi-Account Support)
-   Income Categories
-   Expense Categories
-   Income Transactions
-   Expense Transactions
-   Account Balance Calculations
-   Financial Reporting
-   Export & Filtering Capabilities

This module is:

-   System-independent\
-   Database-agnostic\
-   API-ready\
-   Designed for high transaction volume\
-   Reusable across ERP, CRM, POS, Admin Panels, SaaS, and Enterprise
    Systems

------------------------------------------------------------------------

# 2. Core Design Principles

1.  Clear separation between master data and transactions.
2.  Every transaction must link to:
    -   An Account
    -   A Category
3.  Account balance must update automatically.
4.  Soft delete recommended for transactional safety.
5.  Only one default account allowed at a time.
6.  Must support filtering and export functionality.
7.  Must handle high transaction volume efficiently.

------------------------------------------------------------------------

# 3. Data Architecture

------------------------------------------------------------------------

# 3.1 Accounts (Master - CRUD)

## Purpose

Represents financial storage sources where money is stored or managed.

Examples: - Cash - Bank Account - UPI - Wallet - Petty Cash

Supports **Multi-Account Management**.

------------------------------------------------------------------------

## Fields

  Field Name        Type        Required   Description
  ----------------- ----------- ---------- ---------------------------
  id                Unique ID   Yes        Primary identifier
  account_name      String      Yes        Name of account
  opening_balance   Decimal     Yes        Initial balance
  notes             Text        No         Additional information
  is_default        Boolean     Yes        Indicates default account
  status            Enum        Yes        active / inactive
  created_at        Timestamp   Yes        Creation timestamp
  updated_at        Timestamp   Yes        Update timestamp

------------------------------------------------------------------------

## Business Logic

-   Only one account may have `is_default = true`.
-   Inactive accounts cannot be used in transactions.
-   Prevent deletion if transactions exist.
-   System must support multiple active accounts simultaneously.

### Balance Formula

Current Balance = Opening Balance\
+ Sum(Income Amounts)\
- Sum(Expense Amounts)

OR maintain a running balance updated per transaction.

------------------------------------------------------------------------

# 3.2 Income Module

------------------------------------------------------------------------

## 3.2.1 Income Category (Master - CRUD)

### Fields

  Field Name    Type        Required   Description
  ------------- ----------- ---------- -------------------
  id            Unique ID   Yes        Category ID
  name          String      Yes        Category name
  description   Text        No         Description
  status        Enum        Yes        active / inactive
  created_at    Timestamp   Yes        Creation time
  updated_at    Timestamp   Yes        Update time

------------------------------------------------------------------------

### Rules

-   Cannot delete category if linked to income.
-   Only active categories selectable.

------------------------------------------------------------------------

## 3.2.2 Income Transactions

### Fields

  Field Name           Type        Required   Description
  -------------------- ----------- ---------- ------------------
  id                   Unique ID   Yes        Income ID
  income_date          Date        Yes        Transaction date
  account_id           Reference   Yes        Linked account
  income_category_id   Reference   Yes        Linked category
  amount               Decimal     Yes        Must be \> 0
  remarks              Text        No         Notes
  created_by           User Ref    Yes        Creator
  created_at           Timestamp   Yes        Creation time
  updated_at           Timestamp   Yes        Update time

------------------------------------------------------------------------

### Transaction Logic

On Create: Account Balance += amount

On Update: Adjust difference between old and new amount

On Delete: Account Balance -= amount

Validation: - Amount \> 0 - Account active - Category active - Date
required

------------------------------------------------------------------------

# 3.3 Expense Module

------------------------------------------------------------------------

## 3.3.1 Expense Category (Master - CRUD)

### Fields

  Field Name    Type        Required   Description
  ------------- ----------- ---------- -------------------
  id            Unique ID   Yes        Category ID
  name          String      Yes        Category name
  description   Text        No         Description
  status        Enum        Yes        active / inactive
  created_at    Timestamp   Yes        Creation time
  updated_at    Timestamp   Yes        Update time

------------------------------------------------------------------------

## 3.3.2 Expense Transactions

### Fields

  Field Name            Type        Required   Description
  --------------------- ----------- ---------- -----------------
  id                    Unique ID   Yes        Expense ID
  expense_date          Date        Yes        Date
  account_id            Reference   Yes        Linked account
  expense_category_id   Reference   Yes        Linked category
  amount                Decimal     Yes        Must be \> 0
  remarks               Text        No         Notes
  created_by            User Ref    Yes        Creator
  created_at            Timestamp   Yes        Creation time
  updated_at            Timestamp   Yes        Update time

------------------------------------------------------------------------

### Transaction Logic

On Create: Account Balance -= amount

On Update: Adjust difference

On Delete: Account Balance += amount

------------------------------------------------------------------------

# 4. Reporting & Filtering Capabilities

The module must support:

## Filtering Options

-   Filter by Date Range
-   Filter by Account
-   Filter by Category
-   Filter by Created User
-   Combined multi-filter support

------------------------------------------------------------------------

## Required Reports

1.  Account Ledger (Date Range)
2.  Income Summary (Category-wise)
3.  Expense Summary (Category-wise)
4.  Monthly Financial Summary
5.  Profit & Loss

Net Profit = Total Income - Total Expense

------------------------------------------------------------------------

# 5. Export Functionality

The system must support exporting:

-   Income Report
-   Expense Report
-   Ledger Report
-   Profit & Loss Summary

Supported export formats: - PDF - Excel - CSV

Export must respect applied filters.

------------------------------------------------------------------------

# 6. High Transaction Volume Handling

The module must:

-   Efficiently handle large datasets
-   Support pagination
-   Use indexed filtering fields (date, account, category)
-   Ensure safe balance calculations under concurrent transactions
-   Maintain transactional integrity

------------------------------------------------------------------------

# 7. API & Service Layer Expectations

## Accounts

-   Create Account
-   Update Account
-   Delete Account
-   List Accounts
-   Set Default Account

## Income

-   Create Income
-   Update Income
-   Delete Income
-   List Incomes (with filters)

## Expense

-   Create Expense
-   Update Expense
-   Delete Expense
-   List Expenses (with filters)

------------------------------------------------------------------------

# 8. AI Implementation Prompt Template

PROMPT START

Create a reusable Accounting Module with:

1.  Multi-account support via Account Master.
2.  Income & Expense categories (CRUD).
3.  Income & Expense transactions linked to account & category.
4.  Automatic balance calculation.
5.  High transaction volume optimization.
6.  Filtering by date, account, category, user.
7.  Export functionality (PDF, Excel, CSV).
8.  Reporting (Ledger, Summary, Profit & Loss).

Generate: - Data models - Business logic - API structure - Filtering
system - Reporting logic - Export functionality

Ensure modular, production-ready, and scalable architecture.

PROMPT END

------------------------------------------------------------------------

# ✅ Final Summary

This Accounting Module:

✔ Supports Multi-Account Management\
✔ Handles High Transaction Volume\
✔ Provides Advanced Filtering\
✔ Supports Export Functionality\
✔ Maintains Accurate Balance Logic\
✔ Is Fully Reusable and AI-Ready
