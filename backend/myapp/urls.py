from django.urls import path
from .views import AvailabilityListCreateView, AvailabilityDetailView

urlpatterns = [
    path('availability/', AvailabilityListCreateView.as_view(), name='availability-list'),
    path('availability/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),
]
