# FarmBudget — Application Documentation

> **Canonical location:** `docs/sprint-1/feature-vertical-slice.md`  
> **Sprint:** 1 — First functional layer (vertical slice), ICS 532 / GrowForMe Farm Budget.

This document is the **product-facing** description of the FarmBudget SPA (routes, data model, UX). It should be read together with:

- `[../alignment.md](../alignment.md)` — how this lines up with the course brief, DoD, and the Jest contract suite
- `[definition-of-done.md](../sprint-0/definition-of-done.md)` — when work counts as “done”
- `[tdd/README.md](tdd/README.md)` — TDD for **critical financial logic** (standalone contract; see alignment for Vitest vs Jest)

---

## Overview

**FarmBudget** is a project-based budget management application designed for agricultural operations. It allows users to create multiple budgets for different farming projects (e.g. Maize Season, Poultry Cycle, Vegetable Garden), plan spending by category, track actual expenses, record revenue, and analyse financial performance through interactive dashboards and reports.

The application is a single-page application (SPA) that runs entirely in the browser with client-side state management — no backend or database required.

---

## Tech Stack


| Technology           | Version | Purpose                                                           |
| -------------------- | ------- | ----------------------------------------------------------------- |
| **React**            | 18.3    | UI framework (component-based architecture)                       |
| **TypeScript**       | 5.8     | Static type safety across the entire codebase                     |
| **Vite**             | 5.4     | Build tool and development server (HMR, fast builds)              |
| **React Router DOM** | 6.30    | Client-side routing and navigation                                |
| **Tailwind CSS**     | 3.4     | Utility-first CSS framework for styling                           |
| **shadcn/ui**        | —       | Pre-built accessible UI components (built on Radix UI primitives) |
| **Radix UI**         | Various | Headless accessible primitives (Dialog, Select, Dropdown, etc.)   |
| **Recharts**         | 2.15    | Charting library for bar charts, pie charts, and line charts      |
| **Lucide React**     | 0.462   | Icon library                                                      |
| **React Query**      | 5.83    | Data fetching/caching (wired up, ready for API integration)       |
| **Zod**              | 3.25    | Schema validation library                                         |
| **React Hook Form**  | 7.61    | Form management (available for use)                               |
| **date-fns**         | 3.6     | Date utility library                                              |
| **Sonner**           | 1.7     | Toast notification library                                        |
| **Vitest**           | 3.2     | Unit testing framework                                            |
| **Playwright**       | 1.57    | End-to-end browser testing                                        |
| **pnpm**             | —       | Package manager                                                   |


---

## Project Structure

```
src/
├── App.tsx                    # Root component with routing and providers
├── App.css                    # Legacy app styles
├── index.css                  # Global styles, Tailwind config, design tokens
├── main.tsx                   # Application entry point
│
├── contexts/
│   └── BudgetContext.tsx       # Centralised state management (React Context)
│
├── lib/
│   ├── mock-data.ts           # Data model interfaces + seed data
│   └── utils.ts               # Utility functions (cn class merger)
│
├── pages/
│   ├── Index.tsx               # Landing page (renders Dashboard)
│   ├── Dashboard.tsx           # Overview dashboard with charts
│   ├── Budgets.tsx             # Budget listing (card grid)
│   ├── BudgetDetail.tsx        # Single budget breakdown
│   ├── Expenses.tsx            # Expense tracking
│   ├── RevenuePage.tsx         # Revenue/sales tracking
│   ├── Reports.tsx             # Financial analytics
│   └── NotFound.tsx            # 404 page
│
├── components/
│   ├── AppLayout.tsx           # Shell layout (sidebar + header + main)
│   ├── NavLink.tsx             # Navigation link component
│   ├── StatCard.tsx            # Metric display card
│   └── ui/                    # shadcn/ui component library (50+ components)
│
└── hooks/
    ├── use-mobile.tsx          # Mobile viewport detection
    └── use-toast.ts            # Toast notification hook
```

---

## Data Model

### Budget

Represents a project-level budget (e.g. "2026 Maize Season").


| Field         | Type     | Description                             |
| ------------- | -------- | --------------------------------------- |
| `id`          | `string` | Unique identifier                       |
| `name`        | `string` | Display name (e.g. "2026 Maize Season") |
| `project`     | `string` | Project grouping (e.g. "Maize Farm")    |
| `year`        | `number` | Budget year                             |
| `description` | `string` | What the budget covers                  |
| `createdAt`   | `string` | ISO date of creation                    |


> **Note:** The total budget amount is **derived** from the sum of its budget items' planned amounts — it is not stored as a separate field.

### BudgetItem

A planned spending line within a budget.


| Field         | Type     | Description                                        |
| ------------- | -------- | -------------------------------------------------- |
| `id`          | `string` | Unique identifier                                  |
| `budgetId`    | `string` | Parent budget reference                            |
| `category`    | `string` | Spending category (Seeds, Fertilizer, Labor, etc.) |
| `description` | `string` | Detailed description of what this item covers      |
| `planned`     | `number` | Planned/budgeted amount (GHS)                      |
| `actual`      | `number` | Actual amount spent (auto-updated from expenses)   |


### Expense

An individual spending transaction linked to a budget.


| Field      | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `id`       | `string` | Unique identifier              |
| `budgetId` | `string` | Budget this expense belongs to |
| `category` | `string` | Spending category              |
| `amount`   | `number` | Amount spent (GHS)             |
| `date`     | `string` | Date of expense                |
| `notes`    | `string` | Description/notes              |


### Revenue

A sales/income record linked to a budget.


| Field          | Type      | Description                        |
| -------------- | --------- | ---------------------------------- |
| `id`           | `string`  | Unique identifier                  |
| `budgetId`     | `string`  | Budget this revenue belongs to     |
| `product`      | `string`  | Product sold (e.g. "Maize (bags)") |
| `quantity`     | `number`  | Units sold                         |
| `pricePerUnit` | `number`  | Price per unit (GHS)               |
| `total`        | `number`  | Computed total (quantity × price)  |
| `date`         | `string`  | Date of sale                       |
| `status`       | `"paid"   | "pending"`                         |
| `buyer`        | `string?` | Optional buyer name                |


### Expense Categories

`Seeds`, `Fertilizer`, `Labor`, `Transport`, `Equipment`, `Feed`, `Vet/Medicine`, `Pesticides`, `Other`

---

## Features

### 1. Budget Management (`/budgets`)

- **Card grid view** of all budgets with project tag, year badge, and financial summary
- **Create/Edit/Delete** budgets via modal dialog (name, project, year, description)
- **Year filtering** — dropdown to filter budgets by year
- **Financial overview** per card: Planned total, Spent total, Remaining amount
- **Progress bar** with colour coding: green (healthy), amber (>80% used), red (exceeded)
- **Click-through** — clicking a budget card navigates to its detailed breakdown

### 2. Budget Detail (`/budgets/:budgetId`)

- **Summary cards** showing Total Planned, Total Spent, and Variance
- **Budget categories table** with columns: Category, Planned, Actual, Variance, Status, Actions
- **Status column** with intelligent labels:
  - 🟢 **On Track** — utilisation ≤ 75%
  - 🟡 **Near Limit** — utilisation 75–100%
  - 🔴 **Exceeded** — utilisation > 100%
- **Clickable rows** — clicking a budget item opens a detail modal showing:
  - Full description
  - Financial summary (Planned / Actual / Variance)
  - Utilisation progress bar
- **Add/Edit/Delete** budget items with category, planned amount, and description fields
- **Row hover effects** for interactive feel
- **Recent expenses** table showing the last 5 expenses for this budget

### 3. Expense Tracking (`/expenses`)

- **Full expense list** across all budgets
- **Budget selector** in the "Add Expense" dialog — every expense is linked to a specific budget
- **Dual filtering** — filter by budget AND/OR category simultaneously
- **Budget name badge** displayed in the table for each expense
- **Running total** showing filtered sum and item count
- **Add/Delete** expenses with auto-update of the linked budget item's actual amount

### 4. Revenue Tracking (`/revenue`)

- **Record sales** with budget linking, product details, quantity, price, buyer, and payment status
- **Budget filter** — view revenue for a specific budget or all budgets
- **Summary cards** — Total Revenue, Received (paid), Pending
- **Payment status badges** — colour-coded paid/pending indicators
- **Add/Delete** revenue records

### 5. Dashboard (`/`)

- **Budget picker** dropdown to switch between budgets
- **Stat cards** — Total Budget, Expenses (with % of budget), Revenue (with pending count), Net Profit/Loss
- **Monthly Expenses bar chart** — dynamically computed from the selected budget's expense data
- **Expenses by Category pie chart** — donut chart with legend, computed dynamically
- **Recent Expenses table** — last 5 expenses for the selected budget

### 6. Reports (`/reports`)

- **Budget picker** — same as dashboard
- **Key metrics**: Net Profit/Loss, Budget Utilisation %, Revenue per Expense ratio
- **Profit/Loss Over Time** — multi-line chart showing revenue, expenses, and profit trends by month
- **Budget vs Actual** — grouped bar chart comparing planned vs actual per category
- **Expense Breakdown** — pie chart with category totals and legend

### 7. Navigation & Layout

- **Responsive sidebar** — fixed on desktop, slide-out drawer on mobile with overlay
- **Active route highlighting** in sidebar navigation
- **Sidebar footer** — displays the currently selected budget name, project, and year; or a prompt to create/select one
- **Sticky header** with hamburger menu and user avatar
- **Smooth fade-in animation** on page transitions

---

## State Management

All application state is managed through a single **React Context** (`BudgetContext`), providing:

### Data

- `budgets` — all budget records
- `budgetItems` — all budget line items
- `expenses` — all expense records
- `revenues` — all revenue records

### Derived Data

- `selectedBudget` — the currently active budget object
- `budgetItemsForSelected` — items filtered to the selected budget
- `expensesForSelected` — expenses filtered to the selected budget
- `revenuesForSelected` — revenues filtered to the selected budget

### Actions

- Budget CRUD: `addBudget`, `updateBudget`, `deleteBudget`
- Budget Item CRUD: `addBudgetItem`, `updateBudgetItem`, `deleteBudgetItem`
- Expense management: `addExpense`, `deleteExpense`
- Revenue management: `addRevenue`, `deleteRevenue`
- `setSelectedBudgetId` — switch the active budget

### Smart Behaviours

- **Adding an expense** auto-increments the matching budget item's `actual` field
- **Deleting an expense** auto-decrements the matching budget item's `actual` field
- **Deleting a budget** cascades to delete all linked budget items, expenses, and revenues

---

## Design System

### Colour Palette

- **Primary**: Deep green `hsl(142, 45%, 28%)` — farm/nature theme
- **Secondary**: Golden amber `hsl(38, 70%, 55%)`
- **Accent**: Earthy brown `hsl(28, 50%, 45%)`
- **Success**: Vibrant green `hsl(142, 60%, 40%)`
- **Warning**: Amber `hsl(38, 92%, 50%)`
- **Destructive**: Red `hsl(0, 72%, 51%)`
- **Background**: Warm off-white `hsl(40, 33%, 97%)`
- **Sidebar**: Dark green gradient `hsl(142, 30%, 18%)`

### Typography

- **Font**: Inter (Google Fonts) — weights 300–800
- **Responsive sizing** from `text-xs` to `text-2xl`

### Dark Mode

Full dark mode colour scheme defined (activates via `.dark` class).

---

## Routes


| Path                 | Component             | Description               |
| -------------------- | --------------------- | ------------------------- |
| `/`                  | `Index` → `Dashboard` | Dashboard overview        |
| `/budgets`           | `Budgets`             | Budget list (card grid)   |
| `/budgets/:budgetId` | `BudgetDetail`        | Budget category breakdown |
| `/expenses`          | `Expenses`            | Expense tracking          |
| `/revenue`           | `RevenuePage`         | Revenue tracking          |
| `/reports`           | `Reports`             | Financial analytics       |
| `*`                  | `NotFound`            | 404 page                  |


---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Testing

```bash
# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

---

## Currency

All monetary values are displayed in **Ghana Cedis (GHS)** and formatted with locale-aware number separators via `.toLocaleString()`.