from django.urls import path
from .views import *

urlpatterns = [
    path('availability/', UserEventListCreateView.as_view(), name='user-event-list'),
    path('availability/<int:pk>/', UserEventDetailView.as_view(), name='user-event-detail'),
    path("availability/filter/", FilteredUserEventView.as_view(), name="filtered-user-events"),
    path('register/', UserCreateView.as_view(), name='user-register'),
]