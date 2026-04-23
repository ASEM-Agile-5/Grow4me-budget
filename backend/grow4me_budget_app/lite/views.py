import datetime
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.db.models import Sum

from members.models import Accounts
from budget.models import Budget, BudgetItem, Expense, Sale
from .sms import send_sms

User = get_user_model()


def _lite_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if 'lite_user_id' not in request.session:
            return redirect('/lite/login/')
        return view_func(request, *args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper


def _get_user(request):
    user_id = request.session.get('lite_user_id')
    if not user_id:
        return None
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


def login_view(request):
    error = ''
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')
        try:
            user = User.objects.get(email=email)
            if user.check_password(password) and user.is_active:
                request.session['lite_user_id'] = str(user.id)
                return redirect('/lite/')
            error = 'Wrong password.'
        except User.DoesNotExist:
            error = 'No account found.'
    return render(request, 'lite/login.html', {'error': error})


@_lite_login_required
def home_view(request):
    user = _get_user(request)
    year = datetime.date.today().year
    budgets = Budget.objects.filter(user=user, year=year)
    total_budget = float(
        BudgetItem.objects.filter(budget__in=budgets).aggregate(total=Sum('planned_amount'))['total'] or 0
    )
    total_expenses = float(
        Expense.objects.filter(user=user, date__year=year).aggregate(total=Sum('amount'))['total'] or 0
    )
    total_sales = float(
        Sale.objects.filter(user=user, date__year=year).aggregate(total=Sum('total_amount'))['total'] or 0
    )
    balance = total_sales - total_expenses
    pct = round(total_expenses / total_budget * 100, 1) if total_budget > 0 else 0

    try:
        account = Accounts.objects.get(user=user)
        phone = account.phone or ''
        name = account.first_name or user.email
    except Accounts.DoesNotExist:
        phone = ''
        name = user.email

    return render(request, 'lite/home.html', {
        'year': year,
        'total_budget': '{:,.2f}'.format(total_budget),
        'total_expenses': '{:,.2f}'.format(total_expenses),
        'total_sales': '{:,.2f}'.format(total_sales),
        'balance': '{:,.2f}'.format(balance),
        'pct': pct,
        'phone': phone,
        'name': name,
        'msg': request.GET.get('msg', ''),
        'sms_err': request.GET.get('sms_err', 'unknown error'),
    })


@_lite_login_required
def expense_view(request):
    user = _get_user(request)
    year = datetime.date.today().year
    budgets = Budget.objects.filter(user=user, year=year).order_by('name')
    error = ''

    if request.method == 'POST':
        budget_id = request.POST.get('budget', '').strip()
        amount = request.POST.get('amount', '').strip()
        description = request.POST.get('description', '').strip()

        if not budget_id or not amount:
            error = 'Budget and amount are required.'
        else:
            try:
                budget = Budget.objects.get(id=budget_id, user=user)
                misc_item = (
                    BudgetItem.objects.filter(budget=budget, category__category_name='Misc').first()
                    or BudgetItem.objects.filter(budget=budget).first()
                )
                if not misc_item:
                    error = 'No budget items found. Set up your budget first.'
                else:
                    Expense.objects.create(
                        budget=budget,
                        budget_item=misc_item,
                        user=user,
                        amount=float(amount),
                        notes=description,
                        date=datetime.date.today(),
                    )
                    return redirect('/lite/?msg=expense')
            except (Budget.DoesNotExist, ValueError):
                error = 'Invalid input.'

    return render(request, 'lite/expense.html', {'budgets': budgets, 'error': error})


@_lite_login_required
def sale_view(request):
    user = _get_user(request)
    year = datetime.date.today().year
    budgets = Budget.objects.filter(user=user, year=year).order_by('name')
    error = ''

    if request.method == 'POST':
        budget_id = request.POST.get('budget', '').strip()
        product = request.POST.get('product', '').strip()
        amount = request.POST.get('amount', '').strip()

        if not budget_id or not product or not amount:
            error = 'All fields are required.'
        else:
            try:
                budget = Budget.objects.get(id=budget_id, user=user)
                Sale.objects.create(
                    budget=budget,
                    user=user,
                    product=product,
                    quantity=1,
                    price_per_unit=float(amount),
                    date=datetime.date.today(),
                    payment_status='paid',
                )
                return redirect('/lite/?msg=sale')
            except (Budget.DoesNotExist, ValueError):
                error = 'Invalid input.'

    return render(request, 'lite/sale.html', {'budgets': budgets, 'error': error})


@_lite_login_required
def set_phone_view(request):
    user = _get_user(request)
    error = ''

    if request.method == 'POST':
        phone = request.POST.get('phone', '').strip()
        if not phone:
            error = 'Phone number is required.'
        else:
            try:
                account = Accounts.objects.get(user=user)
                account.phone = phone
                account.save()
                return redirect('/lite/')
            except Accounts.DoesNotExist:
                error = 'Account not found.'

    return render(request, 'lite/set_phone.html', {'error': error})


@_lite_login_required
def send_sms_view(request):
    if request.method != 'POST':
        return redirect('/lite/')

    user = _get_user(request)

    try:
        account = Accounts.objects.get(user=user)
        phone = account.phone
    except Accounts.DoesNotExist:
        phone = None

    if not phone:
        return redirect('/lite/phone/')

    year = datetime.date.today().year
    budgets = Budget.objects.filter(user=user, year=year)
    total_budget = float(
        BudgetItem.objects.filter(budget__in=budgets).aggregate(total=Sum('planned_amount'))['total'] or 0
    )
    total_expenses = float(
        Expense.objects.filter(user=user, date__year=year).aggregate(total=Sum('amount'))['total'] or 0
    )
    total_sales = float(
        Sale.objects.filter(user=user, date__year=year).aggregate(total=Sum('total_amount'))['total'] or 0
    )
    balance = total_sales - total_expenses
    pct = round(total_expenses / total_budget * 100, 1) if total_budget > 0 else 0

    msg = (
        f"Grow4Me {year}\n"
        f"Budget: GHS {total_budget:,.0f}\n"
        f"Used: GHS {total_expenses:,.0f} ({pct}%)\n"
        f"Sales: GHS {total_sales:,.0f}\n"
        f"Expenses: GHS {total_expenses:,.0f}\n"
        f"Balance: GHS {balance:,.0f}"
    )

    from django.conf import settings as django_settings
    if not django_settings.MNOTIFY_API_KEY:
        return redirect('/lite/?msg=sms_fail&sms_err=API+key+not+configured')

    result = send_sms(phone, msg)
    print("mNotify response:", result)
    status = str(result.get('status', '')).lower()
    if status in ('success', '200', 'true', '1'):
        return redirect('/lite/?msg=sms_ok')
    err = result.get('message', str(result))[:80]
    from urllib.parse import quote
    return redirect('/lite/?msg=sms_fail&sms_err=' + quote(str(err)))


def logout_view(request):
    request.session.flush()
    return redirect('/lite/login/')
