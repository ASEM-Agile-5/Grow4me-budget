# Budget API Documentation

This document describes all available endpoints for the Budget application, including their purpose, request payloads, and sample responses.

## Authentication

All endpoints require authentication. Include the JWT token in either:

- **Authorization Header**: `Bearer <token>`
- **Cookie**: `access_token=<token>`

---

## 1. Budgets

### Create Budget

Create a new budget for a specific project and year.

- **Endpoint**: `POST /budget/create`
- **Payload**:
  ```json
  {
    "name": "Q1 2026 Operations",
    "project": "f1f9c656-78e9-... (Project UUID)",
    "year": 2026,
    "description": "Operational budget for the first quarter."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Budget created successfully",
    "budget_id": "8472-..."
  }
  ```

- **Note**: Every new budget automatically comes with a pre-installed budget item named **'Misc'** with a planned amount of `0.00`.


### List All Budgets

Get a list of all budgets belonging to the authenticated user.

- **Endpoint**: `GET /budget/all`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "8472-...",
      "name": "Q1 2026 Operations",
      "year": 2026,
      "description": "...",
      "planned": 5000.0,
      "spent": 1200.0,
      "left": 3800.0
    }
  ]
  ```

### Budget Details

Get detailed information about a budget, including all line items and aggregates.

- **Endpoint**: `GET /budget/details/<budget_id>`
- **Response (200 OK)**:
  ```json
  {
    "id": "8472-...",
    "name": "Q1 2026 Operations",
    "year": 2026,
    "total_planned": 5000.0,
    "total_spent": 1200.0,
    "variance": 3800.0,
    "budget_items": [
      {
        "id": "item-uuid",
        "category_name": "Equipment",
        "planned_amount": 2000.0,
        "spent": 500.0
      }
    ]
  }
  ```

---

## 2. Categories

### List Categories

Get all globally shared budget categories.

- **Endpoint**: `GET /budget/categories`
- **Response (200 OK)**:
  ```json
  [
    { "id": "uuid-1", "category_name": "Labor" },
    { "id": "uuid-2", "category_name": "Materials" }
  ]
  ```

### Create Category

Add a new global budget category.

- **Endpoint**: `POST /budget/categories/create`
- **Payload**:
  ```json
  {
    "category_name": "Logistics",
    "description": "Transport and shipping costs."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Category created successfully",
    "category_id": "uuid-new"
  }
  ```

---

## 3. Budget Items

### Add Budget Item

Add a specific line item (category + planned amount) to an existing budget.

- **Endpoint**: `POST /budget/items/create`
- **Payload**:
  ```json
  {
    "budget": "budget-uuid",
    "category": "category-uuid",
    "planned_amount": 1500.0,
    "description": "High-quality fertilizer for maize.",
    "inventory": true,
    "quantity": 10,
    "units": "bags"
  }
  ```
- **Note**: If `description` is not provided in the payload, it defaults to the linked Category's description.

### Bulk Add Budget Items

Add multiple line items in a single request.

- **Endpoint**: `POST /budget/items/bulk-create`
- **Payload Mode A: Simple List**: An array of budget item objects.
  ```json
  [
    {
      "budget": "uuid-1",
      "category": "uuid-a",
      "planned_amount": 500.0,
      "description": "Item 1"
    },
    {
      "budget": "uuid-1",
      "category": "uuid-b",
      "planned_amount": 1200.0,
      "inventory": true,
      "quantity": 5
    }
  ]
  ```

- **Payload Mode B: Budget + Items**: A dictionary with `create: true` to create a new budget first.
  ```json
  {
    "create": true,
    "name": "New Budget Name",
    "year": 2026,
    "project": "project-uuid",
    "description": "Budget description",
    "budget_items": [
      {
        "category": "uuid-a",
        "planned_amount": 500.0,
        "description": "Item 1"
      }
    ]
  }
  ```

- **Note**: The entire operation (Budget + all Items) is wrapped in a database transaction. If any part fails, no data is saved.
- **Note**: Setting `inventory: true` automatically creates an entry in the Inventory system for this item.

---

## 4. Expenses

### Create Expense

Record an expense against a budget item.

- **Endpoint**: `POST /budget/expenses/create`
- **Payload**:
  ```json
  {
    "budget_item": "budget-item-uuid",
    "amount": 250.0,
    "date": "2026-04-12",
    "notes": "Purchased 2 bags of fertilizer",
    "quantity": 2
  }
  ```
- **Note**: If the budget item is inventory-tracked, this will automatically add/remove stock based on the quantity.

### Bulk Add Expenses

Record multiple expenses in a single request.

- **Endpoint**: `POST /budget/expenses/bulk-create`
- **Payload**: An array of expense objects.


### List All Expenses

Get a history of all expenses for the user.

- **Endpoint**: `GET /budget/expenses`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "exp-uuid",
      "date": "2026-04-12",
      "budget_name": "Q1 Operations",
      "category_name": "Materials",
      "amount": 250.0,
      "notes": "...",
      "quantity": 2
    }
  ]
  ```

### Recent Expenses

Get the 5 most recent expenses for a specific budget.

- **Endpoint**: `GET /budget/<budget_id>/recent-expenses`

---

## 5. Inventory Management

### List Inventory


View all inventory-tracked items and their current stock levels.

- **Endpoint**: `GET /budget/inventory`
- **Query Params**: `?year=2026&project=<project_id>` (Optional)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "inv-item-uuid",
      "category_name": "Fertilizer",
      "budget_name": "Q1 2026",
      "units": "bags",
      "current_stock": 8,
      "minimum_stock": 5
    }
  ]
  ```

### Manual Stock Adjustment

Manually add or remove stock.

- **Endpoint**: `POST /budget/inventory/edit`
- **Payload**:
  ```json
  {
    "budget_item": "budget-item-uuid",
    "action": "add_stock",
    "quantity": 20,
    "notes": "Restocking after shipment"
  }
  ```

### Set Minimum Stock

Set a threshold for low-stock alerts.

- **Endpoint**: `POST /budget/inventory/set-minimum`
- **Payload**:
  ```json
  {
    "inventory_item": "inv-item-uuid",
    "minimum_stock": 15
  }
  ```

### Inventory Summary

Get summary metrics for all inventory items.

- **Endpoint**: `GET /budget/inventory/summary`
- **Response (200 OK)**:
  ```json
  {
    "total_items": 12,
    "total_units": 450,
    "low_stock_alerts": 3,
    "out_of_stock": 1
  }
  ```

### Inventory History

Get a chronological list of all inventory movements.

- **Endpoint**: `GET /budget/inventory/history`
- **Query Params**: `?year=2026&project=<project_id>` (Optional)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "movement-uuid",
      "budget_item_name": "Fertilizer",
      "action": "remove_stock",
      "quantity": 2,
      "notes": "Used for maize block A",
      "user": {
        "id": "user-uuid",
        "name": "John Farmer"
      },
      "created_at": "2026-04-12T14:30:00Z"
    }
  ]
  ```


---

## 6. Sales

### Create Sale
Record revenue from selling products and optionally deduct the sold quantity from inventory.

- **Endpoint**: `POST /budget/sales/create`
- **Payload**:
  ```json
  {
    "budget_item": "budget-item-uuid",
    "quantity": 10,
    "price_per_unit": 50.00,
    "date": "2026-04-12",
    "buyer": "John Doe",
    "payment_status": "paid"
  }
  ```
- **Note**: The `total_amount` is automatically calculated (`quantity` * `price_per_unit`). If `budget_item` is inventory-tracked, it automatically triggers an `InventoryMovement` to remove stock.

### Bulk Add Sales

Record multiple sales in a single request.

- **Endpoint**: `POST /budget/sales/bulk-create`
- **Payload**: An array of sale objects.


### List Sales
Retrieve a list of all sales for the authenticated user.

- **Endpoint**: `GET /budget/sales`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "sale-uuid",
      "budget_name": "Q2 Maize Budget",
      "product_name": "Maize (bags)",
      "quantity": 10,
      "price_per_unit": "50.00",
      "total_amount": "500.00",
      "date": "2026-04-12",
      "buyer": "John Doe",
      "payment_status": "paid"
    }
  ]
  ```

---

## 7. Dashboards

### Dashboard Summary
Get high-level aggregation for a given year.

- **Endpoint**: `GET /budget/dashboard/summary?year=2026`
- **Response (200 OK)**:
  ```json
  {
    "Total Budget": 50000.00,
    "Revenue": 20000.00,
    "Net Profit": 15000.00
  }
  ```

### Monthly Expenses
Get expenses broken down by month for a given year or specific budget.

- **Endpoint**: `GET /budget/dashboard/monthly-expenses`
- **Query Params**:
  - `year=2026`: (Optional) Scope expenses to a specific year.
  - `budget=<budget_uuid>`: (Optional) Scope expenses to a specific budget.
- **Response (200 OK)**:
  ```json
  {
    "Jan": 3400.50,
    "Feb": 5500.00,
    "Mar": 0,
    ...
  }
  ```

### Category Expenses
Get total expenses per category for a specific budget.

- **Endpoint**: `GET /budget/dashboard/category-expenses?budget=<budget_uuid>`
- **Response (200 OK)**:
  ```json
  {
    "Labour": 3400.50,
    "Feed": 5500.00,
    "Fertilizer": 1200.00
  }
  ```

### Financial Performance & Metrics
Get advanced KPIs and data for charts (Profit over time, Budget vs Actual).

- **Endpoint**: `GET /budget/dashboard/financials`
- **Query Params**: 
  - `year=2026`: (Required if `budget` is not provided) Scope metrics to a specific year.
  - `budget=<budget_uuid>`: (Required if `year` is not provided) Scope metrics to a specific budget.
- **Response (200 OK)**:
  ```json
  {
    "summary": {
      "netProfit": 15000.0,
      "budgetUtilization": 75.5,
      "revenuePerExpense": 2.5,
      "roi": 150.0,
      "totalBudget": 50000.0,
      "totalRevenue": 25000.0,
      "totalExpenses": 10000.0
    },
    "profitLossOverTime": [
       { "month": "Mar", "revenue": 0, "expenses": 5700, "profit": -5700 },
       { "month": "Jul", "revenue": 16300, "expenses": 600, "profit": 15700 }
    ],
    "budgetVsActual": [
       { "category": "Labor", "budgeted": 5000, "actual": 4500 },
       { "category": "Materials", "budgeted": 2000, "actual": 2200 }
    ],
    "expenseBreakdown": {
       "Labor": 4500,
       "Materials": 2200
    }
  }
  ```

---

## 8. AI Budget Translator

### AI-Translate

Automatically convert unstructured text, PDFs, or CSV files into structured budget items using Gemini.

- **Endpoint**: `POST /budget/ai-translate`
- **Payload (Form-Data)**:
  - `text`: (Optional) Natural language description of the budget.
  - `file`: (Optional) PDF extract or CSV file.
- **Rules**:
  - Automatically maps to existing database categories.
  - Falls back to the **'Other'** category if no match is found.
  - Validates CSV headers requirements: `category_name`, `planned_amount`, `description`.
- **Response (200 OK)**:
  ```json
  [
    {
      "category_id": "uuid-1",
      "category_name": "Labor",
      "planned_amount": "5000.00",
      "description": "Payment for harvesting team"
    },
    {
      "category_id": "uuid-other",
      "category_name": "Other",
      "planned_amount": "250.00",
      "description": "Repairs for broken irrigation pipe"
    }
  ]
  ```


---

## 9. Budget Templates

### List Templates

Get a list of all pre-defined budget templates.

- **Endpoint**: `GET /budget/templates`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid-1",
      "name": "Maize Farming Template",
      "description": "Standard setup for 1 hectare of maize",
      "icon": "leaf",
      "budget_items": [
        {
           "category_name": "Labor",
           "planned_amount": 2000,
           "description": "Standard labor cost"
        }
      ]
    }
  ]
  ```

### Bulk Create Templates

Add multiple templates to the shared library.

- **Endpoint**: `POST /budget/templates/bulk-create`
- **Payload**:
  ```json
  {
    "templates": [
      {
        "name": "Poultry Template",
        "description": "Cycle for 1000 birds",
        "icon": "egg",
        "budget_items": [...]
      }
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Templates created successfully",
    "template_ids": ["uuid-1", "uuid-2"]
  }
  ```
