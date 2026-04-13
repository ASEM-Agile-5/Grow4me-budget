from rest_framework import serializers
from django.db.models import Sum, Case, When, Value, F, IntegerField
from decimal import Decimal
from .models import Budget, BudgetCategory, BudgetItem, Expense, InventoryMovement, InventoryItem, Sale


class CreateBudgetSerializer(serializers.ModelSerializer):
    """Validates POST payload for creating a budget."""
    class Meta:
        model = Budget
        fields = ['name', 'project', 'year', 'description']


class BudgetListSerializer(serializers.ModelSerializer):
    """GET list — includes aggregated planned, spent, left."""
    planned = serializers.SerializerMethodField()
    spent = serializers.SerializerMethodField()
    left = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'name', 'year', 'description', 'planned', 'spent', 'left']

    def get_planned(self, obj):
        result = BudgetItem.objects.filter(budget=obj).aggregate(
            total=Sum('planned_amount')
        )
        return result['total'] or Decimal('0')

    def get_spent(self, obj):
        result = Expense.objects.filter(budget=obj).aggregate(
            total=Sum('amount')
        )
        return result['total'] or Decimal('0')

    def get_left(self, obj):
        planned = self.get_planned(obj)
        spent = self.get_spent(obj)
        return planned - spent


class BudgetDetailSerializer(serializers.ModelSerializer):
    """GET detail — total_planned, total_spent, variance."""
    total_planned = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    variance = serializers.SerializerMethodField()
    budget_items = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'name', 'year', 'description', 'total_planned', 'total_spent', 'variance', 'budget_items']

    def get_budget_items(self, obj):
        from .serializers import CreateBudgetItemSerializer
        budget_items = BudgetItem.objects.filter(budget=obj)
        return CreateBudgetItemSerializer(budget_items, many=True).data

    def get_total_planned(self, obj):
        result = BudgetItem.objects.filter(budget=obj).aggregate(
            total=Sum('planned_amount')
        )
        return result['total'] or Decimal('0')

    def get_total_spent(self, obj):
        result = Expense.objects.filter(budget=obj).aggregate(
            total=Sum('amount')
        )
        return result['total'] or Decimal('0')

    def get_variance(self, obj):
        return self.get_total_planned(obj) - self.get_total_spent(obj)


class BudgetCategorySerializer(serializers.ModelSerializer):
    """GET/POST for globally shared categories."""
    class Meta:
        model = BudgetCategory
        fields = ['id', 'category_name']
        read_only_fields = ['id']


class CreateBudgetItemSerializer(serializers.ModelSerializer):
    """POST budget item — budget ID in request body."""
    id = serializers.UUIDField(read_only=True)
    category_id = serializers.SerializerMethodField()
    inventory = serializers.BooleanField(write_only=True, required=False, default=False)
    quantity = serializers.IntegerField(write_only=True, required=False, default=0)
    units = serializers.CharField(write_only=True, required=False, default='')
    spent = serializers.SerializerMethodField()

    class Meta:
        model = BudgetItem
        fields = [
            'id', 'budget', 'category_id', 'planned_amount', 'spent',
            'category_name', 'inventory', 'quantity', 'units'
        ]
        read_only_fields = ['category_name']

    def get_category_id(self, obj):
        category = obj.get('category') if isinstance(obj, dict) else obj.category
        return category.id if category else None

    def get_spent(self, obj):
        result = Expense.objects.filter(budget_item=obj).aggregate(
            total=Sum('amount')
        )
        return result['total'] or Decimal('0')

class ExpenseSerializer(serializers.ModelSerializer):
    """GET all expenses — includes budget name and category name."""
    budget_name = serializers.CharField(source='budget.name', read_only=True)
    category_name = serializers.CharField(source='budget_item.category.category_name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'date', 'budget', 'budget_name',
            'category_name', 'budget_item', 'notes', 'amount', 
            'inventory', 'quantity'
        ]


class CreateExpenseSerializer(serializers.ModelSerializer):
    """POST expense — prefers budget_item over separate budget/category IDs."""
    # We make these optional because they can be inferred from budget_item
    budget = serializers.PrimaryKeyRelatedField(queryset=Budget.objects.all(), required=False)
    budget_item = serializers.PrimaryKeyRelatedField(queryset=BudgetItem.objects.all(), required=True)

    class Meta:
        model = Expense
        fields = ['budget_item', 'budget', 'amount', 'date', 'notes', 'quantity']

    def validate(self, attrs):
        # If budget_item is provided, auto-set budget and category
        if 'budget_item' in attrs:
            bi = attrs['budget_item']
            attrs['budget'] = bi.budget
        elif not attrs.get('budget'):
            raise serializers.ValidationError("Either budget_item or both budget and category must be provided.")
        return attrs


class RecentExpenseSerializer(serializers.ModelSerializer):
    """GET recent expenses for a budget."""
    category_name = serializers.CharField(source='budget_item.category.category_name', read_only=True)

    class Meta:
        model = Expense
        fields = ['budget_item', 'amount', 'notes', 'inventory', 'quantity', 'date', 'category_name']


# ──────────────────────────────────────────────
# Inventory Serializers
# ──────────────────────────────────────────────

class CreateInventoryItemSerializer(serializers.ModelSerializer):
    """POST /budget/inventory/create — Create an inventory record for a budget item."""
    class Meta:
        model = InventoryItem
        fields = ['budget_item', 'units', 'minimum_stock']


class InventoryMovementSerializer(serializers.Serializer):
    """POST /budget/inventory/edit — Add or remove stock."""
    budget_item = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['add_stock', 'remove_stock'])
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, default='')


class SetMinimumStockSerializer(serializers.Serializer):
    """POST /budget/inventory/set-minimum — Set minimum stock threshold on InventoryItem."""
    inventory_item = serializers.UUIDField()
    minimum_stock = serializers.IntegerField(min_value=0)


class InventoryListSerializer(serializers.ModelSerializer):
    """
    GET inventory list — aggregates current_stock per InventoryItem
    using the same Sum(Case(When)) pattern as UserSerializer.get_balance.
    """
    category_name = serializers.CharField(source='budget_item.category.category_name', read_only=True)
    budget_name = serializers.CharField(source='budget_item.budget.name', read_only=True)
    budget_id = serializers.UUIDField(source='budget_item.budget.id', read_only=True)
    budget_item_id = serializers.UUIDField(source='budget_item.id', read_only=True)
    planned_amount = serializers.DecimalField(source='budget_item.planned_amount', max_digits=12, decimal_places=2, read_only=True)
    current_stock = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'budget_item_id', 'budget_id', 'budget_name',
            'category_name', 'planned_amount',
            'units', 'minimum_stock', 'current_stock',
        ]

    def get_current_stock(self, obj):
        result = InventoryMovement.objects.filter(
            budget_item=obj.budget_item
        ).aggregate(
            current_stock=Sum(
                Case(
                    When(action='add_stock', then=F('quantity')),
                    When(action='remove_stock', then=Value(-1) * F('quantity')),
                    default=Value(0),
                    output_field=IntegerField()
                )
            )
        )
        return result['current_stock'] or 0


# ──────────────────────────────────────────────
# Sales Serializers
# ──────────────────────────────────────────────

class SaleSerializer(serializers.ModelSerializer):
    """GET all sales."""
    budget_name = serializers.CharField(source='budget.name', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'budget', 'budget_name', 'product',
            'quantity', 'price_per_unit', 'total_amount', 'date',
            'buyer', 'payment_status', 'created_at'
        ]

class CreateSaleSerializer(serializers.ModelSerializer):
    """POST sale."""
    budget = serializers.PrimaryKeyRelatedField(queryset=Budget.objects.all(), required=False)

    class Meta:
        model = Sale
        fields = ['budget', 'product', 'quantity', 'price_per_unit', 'date', 'buyer', 'payment_status']

