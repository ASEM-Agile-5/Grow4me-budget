# Grow4Me - Budget Management Application (Backend)

## 1. Introduction
The **Grow4Me Budget** backend is a comprehensive financial and operational management system built with **Django** and **Django REST Framework (DRF)**. It is designed to empower agricultural project managers with real-time tracking of budgets, expenses, inventory, and sales, augmented by AI-driven data entry and deep financial analytics.

---

## 2. Technology Stack
- **Framework**: Django 6.0.3 + Django REST Framework 3.15+.
- **Database**: PostgreSQL (handling multi-dimensional financial aggregates and `ArrayField`).
- **Authentication**: Stateful JWT authentication (Header + HTTP-only Cookie).
- **AI Integration**: Google Gemini 2.0 Flash for semantic category mapping and document parsing.
- **Caching & Perf**: Redis (integrated for caching), WhiteNoise (static file serving).
- **Infrastructure**: Production-ready configuration for Google Cloud Run / Cloud SQL.

---

## 3. High-Level Feature Overview

### 🔐 1. Identity & Role Management
- **Secure Registration**: Encrypted password storage using Django's `PBKDF2`.
- **Hybrid JWT Auth**: Returns tokens in both response bodies (for storage) and HTTP-only, secure cookies (to mitigate XSS).
- **Custom Account Profiles**: Automatic generation of human-readable account IDs (e.g., `PV-58291`).
- **Role-Based Access Control (RBAC)**: 
    - `USER`: standard access to personal budgets and assigned projects.
    - `ADMIN`: exclusive access to administrative endpoints like `UpdateUserRole`.
- **Logout**: Stateless logout by clearing client-side cookies.

### 📂 2. Project & Team Coordination
- **Project Lifecycle**: Creation of projects with detailed metadata (location, operational vs. capital budget targets).
- **Membership System**: A `ManyToManyField` with a custom `through` model (`Membership`) to track user investments and join dates.
- **Access Control**: Users can only see and manage budgets for projects where they are explicitly added as members.
- **Task Backlog**: Integrated task tracking with Priority (`High`, `Medium`, `Low`) and Status (`Pending`, `In-Progress`, `Completed`) levels.

### 💰 3. Budgeting & Financial Control
- **Dynamic Budgets**: Yearly budget definitions for specific projects.
- **Smart Itemization**: 
    - Link budget lines to globally shared `BudgetCategories`.
    - Automatic initialization of a 'Misc' category for every new budget.
- **Bulk Creation**: Transactional API allowing users to create a budget and all its sub-items in a single request, ensuring atomic "all-or-nothing" integrity.
- **Inventory Hooks**: Option to flag a budget item as "Inventory Tracked" at creation.

### 📊 4. Financial Dashboards & KPIs
Interactive data aggregation using complex database queries:
- **Financial Pulse**: Real-time calculation of **ROI**, **Budget Utilization %**, and **Revenue-per-Expense** ratio.
- **Time-Series Analysis**: Monthly breakdown of profit/loss showing revenue vs. expense trends throughout the year.
- **Comparison Engine**: "Budget vs. Actual" analysis per category to identify overspending.
- **Expense Breakdown**: Visual-ready categorization of where the money is going.

### 📦 5. Intelligent Inventory Management
- **Aggregation-Based Stock**: Current stock is not a static number; it is dynamically calculated from a history of `InventoryMovement` logs (`add_stock` vs `remove_stock`).
- **Automatic Adjustments**: 
    - Stock is added when expenses are recorded for inventory-tracked items.
    - Stock is deducted when sales are finalized.
- **Alert System**: Configurable "Minimum Stock" levels that trigger "Low Stock" or "Out of Stock" alerts in the dashboard.
- **Audit Logging**: Every stock change is linked to the budget item, the movement type, and the user who performed it.

### 📈 6. Sales & Revenue Tracking
- **Revenue Logging**: Track price-per-unit, total amounts, and buyer identities.
- **Payment Status**: Support for tracking `Paid` vs `Pending` receipts.
- **Inventory Integration**: Linking sales directly to budget items for automated stock depletion.

### 🧠 7. AI Budget Translator (Gemini 2.0 Flash)
- **Natural Language Parsing**: Convert text like *"I need 500 for seeds and maybe 200 for water next week"* into structured database records.
- **PDF Extraction**: Scan harvest reports or financial summaries and extract table-like data.
- **CSV Processing**: Standardized import for high-volume legacy data.
- **Semantic Mapping**: Uses LLM intelligence to map messy user categories to formal database groups (e.g., "Seeds" -> "Materials").

---

## 4. Database Schema Relationships
- **Budget** 1:M **BudgetItem**: Primary hierarchy.
- **BudgetItem** 1:1 **InventoryItem**: Connects the budget world to physical stock.
- **BudgetItem** 1:M **Expense**: Tracks where the planned money went.
- **InventoryItem** 1:M **InventoryMovement**: The audit trail for physical units.
- **Projects** M:M **Users**: Shared project environments.

---

## 5. Security & Integrity Features
- **Database Transactions**: Intensive use of `transaction.atomic()` to prevent partial saves during multi-step operations (like AI parsing and Bulk Creating).
- **JWT Expiry**: Tokens expire in 150 minutes by default, requiring re-authentication.
- **Delete Triggers**: 
    - Deleting a Budget cascades to its Items and Expenses.
    - Deleting a Budget Item sets its reference to NULL in related Expenses to preserve transaction history for auditing.
- **Graceful Error Handling**: Extensive `try-except` blocks with full traceback logging for backend diagnostics.
