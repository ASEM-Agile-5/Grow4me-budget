import traceback
import jwt
from rest_framework import status, views
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Sum, Case, When, Value, F, IntegerField
from django.db.models.functions import Coalesce, ExtractMonth

from .models import Budget, BudgetCategory, BudgetItem, Expense, InventoryMovement, InventoryItem, Sale
from .serializers import (
    CreateBudgetSerializer,
    BudgetListSerializer,
    BudgetDetailSerializer,
    BudgetCategorySerializer,
    CreateBudgetItemSerializer,
    ExpenseSerializer,
    CreateExpenseSerializer,
    RecentExpenseSerializer,
    CreateInventoryItemSerializer,
    InventoryMovementSerializer,
    InventoryListSerializer,
    SetMinimumStockSerializer,
    SaleSerializer,
    CreateSaleSerializer,
)

User = get_user_model()


def get_authenticated_user(request):
    """
    Extract and validate the JWT token from the Authorization header or cookie.
    Returns (user, None) on success or (None, Response) on failure.
    """
    token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

    if not token:
        return None, Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload['user_id']
        user = User.objects.get(id=user_id)
        return user, None
    except jwt.ExpiredSignatureError:
        return None, Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return None, Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return None, Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# ──────────────────────────────────────────────
# Budget CRUD
# ──────────────────────────────────────────────

class CreateBudgetView(views.APIView):
    """POST /budget/create — Create a new budget."""

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = CreateBudgetSerializer(data=request.data)
            if serializer.is_valid():
                budget = serializer.save(user=user)
                return Response({
                    "message": "Budget created successfully",
                    "budget_id": str(budget.id),
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BudgetListView(views.APIView):
    """GET /budget/all — List all budgets for the authenticated user."""

    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            budgets = Budget.objects.filter(user=user).order_by('-created_at')
            serializer = BudgetListSerializer(budgets, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BudgetDetailView(views.APIView):
    """GET /budget/details/<budget_id> — Budget details with aggregates."""

    def get(self, request, budget_id):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            budget = Budget.objects.get(id=budget_id, user=user)
            serializer = BudgetDetailSerializer(budget)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Budget.DoesNotExist:
            return Response({"error": "Budget not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# Budget Categories
# ──────────────────────────────────────────────

class BudgetCategoryListView(views.APIView):
    """GET /budget/categories — List all globally shared categories."""

    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            categories = BudgetCategory.objects.all().order_by('category_name')
            serializer = BudgetCategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CreateBudgetCategoryView(views.APIView):
    """POST /budget/categories/create — Add a new global category."""

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = BudgetCategorySerializer(data=request.data)
            if serializer.is_valid():
                category = serializer.save()
                return Response({
                    "message": "Category created successfully",
                    "category_id": str(category.id),
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# Budget Items
# ──────────────────────────────────────────────

class CreateBudgetItemView(views.APIView):
    """POST /budget/items/create — Add a line-item to a budget."""

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = CreateBudgetItemSerializer(data=request.data)
            if serializer.is_valid():
                inventory_flag = serializer.validated_data.pop('inventory', False)
                quantity = serializer.validated_data.pop('quantity', 0)
                units = serializer.validated_data.pop('units', '')

                budget_item = serializer.save(inventory=inventory_flag)

                if inventory_flag:
                    InventoryItem.objects.create(
                        budget_item=budget_item,
                        user=user,
                        units=units
                    )
                    
                    # Seed initial stock if quantity is provided
                    if quantity > 0:
                        InventoryMovement.objects.create(
                            budget_item=budget_item,
                            user=user,
                            action='add_stock',
                            quantity=quantity,
                            notes='Initial stock from budget item creation',
                        )

                return Response({
                    "message": "Budget item created successfully",
                    "item_id": str(budget_item.id),
                    "inventory_enabled": inventory_flag
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# Expenses
# ──────────────────────────────────────────────

class ExpenseListView(views.APIView):
    """GET /budget/expenses — All expenses for the authenticated user."""

    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            expenses = Expense.objects.filter(user=user).select_related(
                'budget', 'budget_item', 'budget_item__category'
            ).order_by('-date')
            serializer = ExpenseSerializer(expenses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CreateExpenseView(views.APIView):
    """POST /budget/expenses/create — Record a new expense.
    If inventory=True, also creates a remove_stock InventoryMovement on the
    matching BudgetItem (same budget + category).
    """

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = CreateExpenseSerializer(data=request.data)
            if serializer.is_valid():
               
                expense = serializer.save(user=user)
                print(expense.budget_item.inventory)
                # Auto-create inventory removal when expense is inventory-tracked
                if  expense.quantity > 0 and expense.budget_item.inventory:
                    budget_item = expense.budget_item
                    
                    # Get or create the anchor InventoryItem for this budget item
                    inventory_item, created = InventoryItem.objects.get_or_create(
                        budget_item=budget_item,
                        defaults={
                            'user': user,
                            'units': 'units'  # Default unit if auto-created
                        }
                    )

                    # Record the stock removal
                    InventoryMovement.objects.create(
                        budget_item=budget_item,
                        user=user,
                        action='add_stock',
                        quantity=expense.quantity,
                        notes=f'Expense notes: {expense.notes}' if expense.notes else 'Added from expenses',
                    )

                return Response({
                    "message": "Expense created successfully",
                    "expense_id": str(expense.id),
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RecentExpensesView(views.APIView):
    """GET /budget/<budget_id>/recent-expenses — Last 5 expenses for a budget."""

    def get(self, request, budget_id):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            budget = Budget.objects.get(id=budget_id, user=user)

            expenses = Expense.objects.filter(
                budget=budget
            ).select_related('budget').order_by('-date')[:5]

            serializer = RecentExpenseSerializer(expenses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Budget.DoesNotExist:
            return Response({"error": "Budget not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# Inventory
# ──────────────────────────────────────────────

class CreateInventoryItemView(views.APIView):
    """POST /budget/inventory/create — Create an inventory record for an existing budget item."""

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = CreateInventoryItemSerializer(data=request.data)
            if serializer.is_valid():
                inventory_item = serializer.save(user=user)

                # Seed initial stock if quantity is provided
                quantity = int(request.data.get('quantity', 0))
                if quantity > 0:
                    InventoryMovement.objects.create(
                        budget_item=inventory_item.budget_item,
                        user=user,
                        action='add_stock',
                        quantity=quantity,
                        notes='Initial stock',
                    )

                return Response({
                    "message": "Inventory item created successfully",
                    "inventory_item_id": str(inventory_item.id),
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class InventoryListView(views.APIView):
    """GET /budget/inventory?year=2026&project=<uuid>
    Lists all InventoryItems with aggregated current_stock.
    Filtered by year and project via the BudgetItem → Budget relation.
    """

    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            year = request.query_params.get('year')
            project = request.query_params.get('project')

            items = InventoryItem.objects.filter(
                user=user,
            ).select_related('budget_item__category', 'budget_item__budget')

            if year:
                items = items.filter(budget_item__budget__year=int(year))
            if project:
                items = items.filter(budget_item__budget__project_id=project)

            items = items.order_by('budget_item__category__category_name')
            serializer = InventoryListSerializer(items, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EditInventoryView(views.APIView):
    """POST /budget/inventory/edit — Add or remove stock manually."""

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = InventoryMovementSerializer(data=request.data)
            if serializer.is_valid():
                budget_item_id = serializer.validated_data['budget_item']

                # Verify the budget item exists, belongs to user, and has an InventoryItem
                try:
                    budget_item = BudgetItem.objects.get(
                        id=budget_item_id,
                        budget__user=user,
                    )
                    # Ensure it has an inventory record
                    budget_item.inventory_item
                except (BudgetItem.DoesNotExist, InventoryItem.DoesNotExist):
                    return Response(
                        {"error": "Inventory-tracked budget item not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                movement = InventoryMovement.objects.create(
                    budget_item=budget_item,
                    user=user,
                    action=serializer.validated_data['action'],
                    quantity=serializer.validated_data['quantity'],
                    notes=serializer.validated_data.get('notes', ''),
                )

                return Response({
                    "message": f"Stock {serializer.validated_data['action'].replace('_', ' ')} successful",
                    "movement_id": str(movement.id),
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SetMinimumStockView(views.APIView):
    """POST /budget/inventory/set-minimum — Set the minimum stock threshold on InventoryItem."""

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = SetMinimumStockSerializer(data=request.data)
            if serializer.is_valid():
                inventory_item_id = serializer.validated_data['inventory_item']

                try:
                    inventory_item = InventoryItem.objects.get(
                        id=inventory_item_id,
                        user=user,
                    )
                except InventoryItem.DoesNotExist:
                    return Response(
                        {"error": "Inventory item not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                inventory_item.minimum_stock = serializer.validated_data['minimum_stock']
                inventory_item.save(update_fields=['minimum_stock'])

                return Response({
                    "message": "Minimum stock updated successfully",
                    "inventory_item_id": str(inventory_item.id),
                    "minimum_stock": inventory_item.minimum_stock,
                }, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class InventorySummaryView(views.APIView):
    """GET /budget/inventory/summary — Get summary metrics for inventory."""

    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            # Get all inventory items with their current stock annotated
            # We reuse the same logic as InventoryListSerializer but on a queryset
            items = InventoryItem.objects.filter(user=user).annotate(
                total_stock=Coalesce(Sum(
                    Case(
                        When(budget_item__movements__action='add_stock', then=F('budget_item__movements__quantity')),
                        When(budget_item__movements__action='remove_stock', then=Value(-1) * F('budget_item__movements__quantity')),
                        default=Value(0),
                        output_field=IntegerField()
                    )
                ), 0)
            )

            total_items = items.count()
            total_units = items.aggregate(total=Sum('total_stock'))['total'] or 0
            low_stock = items.filter(total_stock__lt=F('minimum_stock'), total_stock__gt=0).count()
            out_of_stock = items.filter(total_stock__lte=0).count()

            return Response({
                "total_items": total_items,
                "total_units": total_units,
                "low_stock_alerts": low_stock,
                "out_of_stock": out_of_stock
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# ──────────────────────────────────────────────
# Sales
# ──────────────────────────────────────────────

class SaleListView(views.APIView):
    """GET /budget/sales — All sales for the authenticated user."""

    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            sales = Sale.objects.filter(user=user).select_related(
                'budget', 'budget_item', 'budget_item__category'
            ).order_by('-date')
            serializer = SaleSerializer(sales, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CreateSaleView(views.APIView):
    """POST /budget/sales/create — Record a new sale.
    Also creates a remove_stock InventoryMovement on the matching BudgetItem.
    """

    def post(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response:
            return error_response

        try:
            serializer = CreateSaleSerializer(data=request.data)
            if serializer.is_valid():
                sale = serializer.save(user=user)

                # Auto-create inventory removal if applicable
                if sale.quantity > 0 and sale.budget_item and sale.budget_item.inventory:
                    budget_item = sale.budget_item
                    
                    # Ensure it has an inventory record
                    inventory_item, created = InventoryItem.objects.get_or_create(
                        budget_item=budget_item,
                        defaults={
                            'user': user,
                            'units': 'units' 
                        }
                    )

                    # Record the stock removal
                    InventoryMovement.objects.create(
                        budget_item=budget_item,
                        user=user,
                        action='remove_stock',
                        quantity=sale.quantity,
                        notes=f'Sale to {sale.buyer}' if sale.buyer else 'Removed for sale',
                    )

                return Response({
                    "message": "Sale created successfully",
                    "sale_id": str(sale.id),
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# ──────────────────────────────────────────────
# Dashboards
# ──────────────────────────────────────────────

class DashboardSummaryView(views.APIView):
    """GET /budget/dashboard/summary?year=2026"""
    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response: return error_response

        year = request.query_params.get('year')
        if not year:
            return Response({"error": "year parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Total Budget
            budgets = Budget.objects.filter(user=user, year=year)
            total_budget = BudgetItem.objects.filter(budget__in=budgets).aggregate(total=Sum('planned_amount'))['total'] or 0

            # Revenue
            revenue = Sale.objects.filter(user=user, date__year=year).aggregate(total=Sum('total_amount'))['total'] or 0

            # Total Expenses
            total_expenses = Expense.objects.filter(user=user, date__year=year).aggregate(total=Sum('amount'))['total'] or 0

            net_profit = revenue - total_expenses

            return Response({
                "Total Budget": total_budget,
                "Revenue": revenue,
                "Net Profit": net_profit
            }, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MonthlyExpensesView(views.APIView):
    """GET /budget/dashboard/monthly-expenses?year=2026"""
    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response: return error_response

        year = request.query_params.get('year')
        if not year:
            return Response({"error": "year parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            expenses = Expense.objects.filter(user=user, date__year=year).annotate(
                month=ExtractMonth('date')
            ).values('month').annotate(total=Sum('amount')).order_by('month')

            month_names = {
                1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
                7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
            }

            result = {month_names[i]: 0 for i in range(1, 13)}
            for exp in expenses:
                if exp['month'] in month_names:
                    result[month_names[exp['month']]] = float(exp['total'] or 0)

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CategoryExpensesView(views.APIView):
    """GET /budget/dashboard/category-expenses?budget=<budget_id>"""
    def get(self, request):
        user, error_response = get_authenticated_user(request)
        if error_response: return error_response

        budget_id = request.query_params.get('budget')
        if not budget_id:
            return Response({"error": "budget parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            expenses = Expense.objects.filter(user=user, budget_id=budget_id).select_related(
                'budget_item__category'
            ).values('budget_item__category__category_name').annotate(
                total=Sum('amount')
            ).order_by('budget_item__category__category_name')

            result = {}
            for exp in expenses:
                cat_name = exp['budget_item__category__category_name']
                if not cat_name:
                    cat_name = 'Uncategorized'
                result[cat_name] = float(exp['total'] or 0)

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

