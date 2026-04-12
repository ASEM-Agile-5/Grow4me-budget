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
    "category_name": "Logistics"
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
    "inventory": true,
    "quantity": 10,
    "units": "bags"
  }
  ```
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

## 6. Sales

### Create Sale

Record revenue from selling products and optionally deduct the sold quantity from inventory.

- **Endpoint**: `POST /budget/sales/create`
- **Payload**:
  ```json
  {
    "budget": "budget-item-uuid",
    "product": "budget-item-uuid",
    "quantity": 10,
    "price_per_unit": 50.0,
    "date": "2026-04-12",
    "buyer": "John Doe",
    "payment_status": "paid"
  }
  ```
- **Note**: The `total_amount` is automatically calculated (`quantity` \* `price_per_unit`). If `budget_item` is inventory-tracked, it automatically triggers an `InventoryMovement` to remove stock.

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
    "Total Budget": 50000.0,
    "Revenue": 20000.0,
    "Net Profit": 15000.0
  }
  ```

### Monthly Expenses

Get expenses broken down by month for a given year.

- **Endpoint**: `GET /budget/dashboard/monthly-expenses?year=2026`
- **Response (200 OK)**:
  ```json
  {
    "Jan": 3400.5,
    "Feb": 5500.0,
    "Mar": 0,
    "Apr": 0,
    "May": 0,
    "Jun": 0,
    "Jul": 0,
    "Aug": 0,
    "Sep": 0,
    "Oct": 0,
    "Nov": 0,
    "Dec": 0
  }
  ```

### Category Expenses

Get total expenses per category for a specific budget.

- **Endpoint**: `GET /budget/dashboard/category-expenses?budget=<budget_uuid>`
- **Response (200 OK)**:
  ```json
  {
    "Labour": 3400.5,
    "Feed": 5500.0,
    "Fertilizer": 1200.0
  }
  ```
