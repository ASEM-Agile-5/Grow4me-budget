from django.db import models
from django.contrib.postgres.fields import ArrayField
from members.models import Accounts
from django.conf import settings
from django.contrib.auth import get_user_model
import uuid
import random
import string

User = get_user_model()


def generate_project_id():
    """Generates a unique PJ + 5 digit string."""
    while True:
        # Generate 'PJ' + 5 random digits
        code = 'PJ' + ''.join(random.choices(string.digits, k=5))
        # Check if this code already exists in the database
        if not Projects.objects.filter(project_id=code).exists():
            return code

class Projects(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_name = models.CharField(max_length=255, verbose_name="Project Name")
    description = models.TextField()
    progress = models.IntegerField(default=0)
    
    users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="Membership",
        related_name="projects"
    )
    # Budget breakdown
    operational_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    capital_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Needs PostgreSQL for ArrayField
    updates = ArrayField(
        models.CharField(max_length=255),
        blank=True,
        default=list
    )
    
    location = models.CharField(max_length=255)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.project_id} - {self.project_name}"

class Tasks(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('in-progress', 'In Progress'),
        ('pending', 'Pending'),
    ]
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    project = models.ForeignKey(Projects, related_name='backlog', on_delete=models.CASCADE)
    task_id = models.CharField(max_length=50, verbose_name="Task ID")  # Maps to 'id' in JSON
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateField()

    def __str__(self):
        return f"{self.task_id} - {self.title}"
    
class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    # role = models.CharField(max_length=50, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)
    amount_invested = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "project_users"
