from django.db import models
from django.utils import timezone

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending',     'À débuter'),    # 🔘 Gris
        ('in_progress', 'En cours'),     # 🟡 Jaune
        ('done',        'Terminée'),     # 🟢 Vert
        ('overdue',     'Dépassée'),     # 🔴 Rouge
    ]

    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority    = models.IntegerField(default=1)  # 1=basse, 2=moyenne, 3=haute
    due_date    = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calcul du statut "overdue"
        if self.due_date and self.due_date < timezone.now() and self.status != 'done':
            self.status = 'overdue'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title