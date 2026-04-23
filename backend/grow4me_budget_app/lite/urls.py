from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='lite-home'),
    path('login/', views.login_view, name='lite-login'),
    path('logout/', views.logout_view, name='lite-logout'),
    path('expense/', views.expense_view, name='lite-expense'),
    path('sale/', views.sale_view, name='lite-sale'),
    path('phone/', views.set_phone_view, name='lite-phone'),
    path('sms/', views.send_sms_view, name='lite-sms'),
]
