from django.urls import path
from .views import (
    CreateBudgetView,
    BudgetListView,
    BudgetDetailView,
    DeleteBudgetView,
    RecentExpensesView,
    BudgetCategoryListView,
    CreateBudgetCategoryView,
    CreateBudgetItemView,
    BulkCreateBudgetItemView,
    DeleteBudgetItemView,
    ExpenseListView,
    CreateExpenseView,
    BulkCreateExpenseView,
    CreateInventoryItemView,
    InventoryListView,
    EditInventoryView,
    SetMinimumStockView,
    InventorySummaryView,
    InventoryHistoryView,
    SaleListView,
    CreateSaleView,
    BulkCreateSaleView,
    DashboardSummaryView,
    MonthlyExpensesView,
    CategoryExpensesView,
    BudgetAIParseView,
    BudgetTemplateView,
    BulkCreateBudgetTemplateView,
    BudgetFinancialMetricsView,
)

urlpatterns = [
    # Budgets
    path('create', CreateBudgetView.as_view()),
    path('all', BudgetListView.as_view()),
    path('delete/<uuid:budget_id>', DeleteBudgetView.as_view()),
    path('details/<uuid:budget_id>', BudgetDetailView.as_view()),

    # Budget Categories
    path('categories', BudgetCategoryListView.as_view()),
    path('categories/create', CreateBudgetCategoryView.as_view()),

    # Budget Items
    path('items/create', CreateBudgetItemView.as_view()),
    path('items/bulk-create', BulkCreateBudgetItemView.as_view()),
    path('items/delete/<uuid:item_id>', DeleteBudgetItemView.as_view()),

    # Expenses
    path('expenses', ExpenseListView.as_view()),
    path('expenses/create', CreateExpenseView.as_view()),
    path('expenses/bulk-create', BulkCreateExpenseView.as_view()),
    path('<uuid:budget_id>/recent-expenses', RecentExpensesView.as_view()),

    # Inventory
    path('inventory', InventoryListView.as_view()),
    path('inventory/create', CreateInventoryItemView.as_view()),
    path('inventory/edit', EditInventoryView.as_view()),
    path('inventory/set-minimum', SetMinimumStockView.as_view()),
    path('inventory/summary', InventorySummaryView.as_view()),
    path('inventory/history', InventoryHistoryView.as_view()),

    # Sales
    path('sales', SaleListView.as_view()),
    path('sales/create', CreateSaleView.as_view()),
    path('sales/bulk-create', BulkCreateSaleView.as_view()),

    # Dashboards
    path('dashboard/summary', DashboardSummaryView.as_view()),
    path('dashboard/monthly-expenses', MonthlyExpensesView.as_view()),
    path('dashboard/category-expenses', CategoryExpensesView.as_view()),
    path('dashboard/financials', BudgetFinancialMetricsView.as_view()),

    # AI Translation
    path('ai-translate', BudgetAIParseView.as_view()),

    # Templates
    path('templates', BudgetTemplateView.as_view()),
    path('templates/bulk-create', BulkCreateBudgetTemplateView.as_view()),
]
