from django.db import models
from django.contrib.auth.models import User

class Availability(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('user', 'date', 'start_time')

    def __str__(self):
        return f"{self.user.username}: {self.date} ({self.start_time}-{self.end_time})"

class Team(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='teams')

    def __str__(self):
        return self.name

