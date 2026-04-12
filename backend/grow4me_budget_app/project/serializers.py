from rest_framework import serializers
from .models import Projects, Tasks, Membership
from django.db.models import Sum
from django.db.models import Q, F, DecimalField, Case, When, Value
from decimal import Decimal


class TaskSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='task_id')
    dueDate = serializers.DateField(source='due_date')

    class Meta:
        model = Tasks
        fields = ['id', 'title', 'status', 'priority', 'dueDate']


class AllProjectSerializer(serializers.ModelSerializer):
    projectId = serializers.CharField(source='project_id', read_only=True)
    projectName = serializers.CharField(source='project_name')
    amountInvested = serializers.SerializerMethodField()
    currentBalance = serializers.DecimalField(source='current_balance', max_digits=12, decimal_places=2)

    class Meta:
        model = Projects
        fields = [
            'id',
            'projectId',
            'projectName',
            'description',
            'progress',
            'location',
            'amountInvested',
            'currentBalance',
        ]

    def get_amountInvested(self, obj):
        """
        amount_invested = sum of all membership investments for this project.
        """
        result = Membership.objects.filter(project=obj).aggregate(
            total=Sum('amount_invested')
        )
        return result['total'] or 0


class ProjectSerializer(serializers.ModelSerializer):
    projectId = serializers.CharField(source='project_id', read_only=True)
    projectName = serializers.CharField(source='project_name')
    backlog = TaskSerializer(many=True, read_only=True)
    budget = serializers.SerializerMethodField()

    class Meta:
        model = Projects
        fields = [
            'projectId',
            'projectName',
            'description',
            'progress',
            'budget',
            'balance',
            'updates',
            'location',
            'backlog'
        ]

    # def get_amount_invested(self, obj):
    #     user_id = self.context.get('user_id')
    #     result = Transaction.objects.filter(
    #         Q(recipient_id=user_id) | Q(sender_id=user_id)
    #     ).aggregate(
    #         balance=Sum(
    #             Case(
    #                 # Project payouts received
    #                 When(transaction_type='project_out', recipient_id=user_id, then=Value(Decimal('-1')) * F('amount')),
    #                 # Project payouts sent (deduct)
    #                 When(transaction_type='project_in', sender_id=user_id, then=F('amount')),
    #                 default=Value(Decimal('0')),
    #                 output_field=DecimalField()
    #             )
    #         )
    #     )
    #     return result['balance'] or Decimal('0')

    def get_budget(self, obj):
        return {
            "operational": obj.operational_budget,
            "capital": obj.capital_budget
        }


class CreateProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new project.
    """
    class Meta:
        model = Projects
        fields = [
            'project_name',
            'description',
            'location',
            'operational_budget',
            'capital_budget',
        ]
