from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Task
from .serializers import TaskListSerializer, TaskDetailSerializer

# Vue Dashboard — liste toutes les tâches
class TaskListView(generics.ListCreateAPIView):
    queryset = Task.objects.all().order_by('-priority', 'due_date')
    serializer_class = TaskListSerializer

# Vue Détail — une seule tâche
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskDetailSerializer

# Vue Stats pour le Dashboard (compteurs par statut)
class DashboardStatsView(APIView):
    def get(self, request):
        return Response({
            'total':       Task.objects.count(),
            'pending':     Task.objects.filter(status='pending').count(),
            'in_progress': Task.objects.filter(status='in_progress').count(),
            'done':        Task.objects.filter(status='done').count(),
            'overdue':     Task.objects.filter(status='overdue').count(),
        })