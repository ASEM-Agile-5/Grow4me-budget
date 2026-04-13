import uuid
from django.db import models
from django.conf import settings
from project.models import Projects


class BudgetCategory(models.Model):
    """Globally shared budget categories (not user-scoped)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category_name = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name_plural = "Budget Categories"

    def __str__(self):
        return self.category_name


class Budget(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, related_name='budgets')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    year = models.IntegerField()
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.year})"


class BudgetItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='items')
    category = models.ForeignKey(BudgetCategory, on_delete=models.CASCADE, related_name='budget_items')
    category_name = models.CharField(max_length=255, blank=True, null=True)
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2)
    inventory = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically populate category_name from the linked category FK
        if self.category and not self.category_name:
            self.category_name = self.category.category_name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category_name or self.category.category_name} - {self.planned_amount}"


class InventoryItem(models.Model):
    """Standalone inventory record linked to a BudgetItem.
    Current stock is aggregated from InventoryMovement rows (not stored here).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget_item = models.OneToOneField(BudgetItem, on_delete=models.CASCADE, related_name='inventory_item')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inventory_items')
    units = models.CharField(max_length=50, blank=True, default='')
    minimum_stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.budget_item.category.category_name} ({self.units})"


class InventoryMovement(models.Model):
    """
    Log table for inventory changes — current stock is computed as an aggregate.
    action='add_stock'    → quantity is added
    action='remove_stock' → quantity is subtracted
    Same pattern as Transaction → UserSerializer.get_balance.
    """
    ACTION_CHOICES = [
        ('add_stock', 'Add Stock'),
        ('remove_stock', 'Remove Stock'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget_item = models.ForeignKey(BudgetItem, on_delete=models.CASCADE, related_name='movements')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inventory_movements')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    quantity = models.IntegerField()
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} {self.quantity} on {self.budget_item}"


class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='expenses')
    budget_item = models.ForeignKey(BudgetItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    notes = models.TextField(blank=True, default='')
    inventory = models.BooleanField(default=False)
    quantity = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically populate budget and category from the linked BudgetItem
        if self.budget_item:
            self.budget = self.budget_item.budget
        super().save(*args, **kwargs)

    def __str__(self):
        return f" {self.amount} ({self.date})"


class Sale(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('pending', 'Pending'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='sales')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sales')
    product = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    date = models.DateField()
    buyer = models.CharField(max_length=255, blank=True, default='')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='paid')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.price_per_unit * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sale on {self.date} - {self.total_amount}"
