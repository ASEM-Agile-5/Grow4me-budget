from django.urls import path
from .views import (
    CreateBudgetView,
    BudgetListView,
    BudgetDetailView,
    RecentExpensesView,
    BudgetCategoryListView,
    CreateBudgetCategoryView,
    CreateBudgetItemView,
    ExpenseListView,
    CreateExpenseView,
    CreateInventoryItemView,
    InventoryListView,
    EditInventoryView,
    SetMinimumStockView,
    InventorySummaryView,
    SaleListView,
    CreateSaleView,
    DashboardSummaryView,
    MonthlyExpensesView,
    CategoryExpensesView,
)

urlpatterns = [
    # Budgets
    path('create', CreateBudgetView.as_view()),
    path('all', BudgetListView.as_view()),
    path('details/<uuid:budget_id>', BudgetDetailView.as_view()),

    # Budget Categories
    path('categories', BudgetCategoryListView.as_view()),
    path('categories/create', CreateBudgetCategoryView.as_view()),

    # Budget Items
    path('items/create', CreateBudgetItemView.as_view()),

    # Expenses
    path('expenses', ExpenseListView.as_view()),
    path('expenses/create', CreateExpenseView.as_view()),
    path('<uuid:budget_id>/recent-expenses', RecentExpensesView.as_view()),

    # Inventory
    path('inventory', InventoryListView.as_view()),
    path('inventory/create', CreateInventoryItemView.as_view()),
    path('inventory/edit', EditInventoryView.as_view()),
    path('inventory/set-minimum', SetMinimumStockView.as_view()),
    path('inventory/summary', InventorySummaryView.as_view()),

    # Sales
    path('sales', SaleListView.as_view()),
    path('sales/create', CreateSaleView.as_view()),

    # Dashboards
    path('dashboard/summary', DashboardSummaryView.as_view()),
    path('dashboard/monthly-expenses', MonthlyExpensesView.as_view()),
    path('dashboard/category-expenses', CategoryExpensesView.as_view()),
]
