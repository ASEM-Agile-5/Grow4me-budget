from django.urls import path
from .views import ProjectDetailsView, AllProjectsView, UserProjectView, CreateProjectView, AddUserToProjectView

urlpatterns = [
    path('details/<str:project_id>', ProjectDetailsView.as_view()),
    path('all', AllProjectsView.as_view()),
    path('user', UserProjectView.as_view()),
    path('create', CreateProjectView.as_view()),
    path('<str:project_id>/add-user', AddUserToProjectView.as_view()),
]
