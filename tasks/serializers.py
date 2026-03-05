from rest_framework import serializers
from .models import Task

# Pour la vue tableau (dashboard) — données légères
class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'priority', 'due_date']

# Pour la vue détail d'une tâche — données complètes
class TaskDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'