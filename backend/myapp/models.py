from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError

class Group(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GroupMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'group')

class UserEvent(models.Model):
    TYPE_CHOICES = [
        ('solo', 'Solo'),
        ('group', 'Group'),
    ]
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.CharField(max_length=1000)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=200, blank=True)
    
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    group = models.ForeignKey(Group, null=True, blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    google_event_id = models.CharField(max_length=256, blank=True, null=True)


    class Meta:
        ordering = ['date', 'start_time']
        
    def clean(self):
        if self.type == 'solo' and not self.user:
            raise ValidationError("Solo events must have a user.")
        if self.type == 'group' and not self.group:
            raise ValidationError("Group events must have a group.")    

    def __str__(self):
        return f"{self.get_type_display()} on {self.date} at {self.start_time}"
