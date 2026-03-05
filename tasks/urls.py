from django.urls import path
from . import views

urlpatterns = [
    path('tasks/',              views.TaskListView.as_view(),     name='task-list'),
    path('tasks/<int:pk>/',     views.TaskDetailView.as_view(),   name='task-detail'),
    path('dashboard/stats/',    views.DashboardStatsView.as_view(), name='dashboard-stats'),
]