from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'groups', GroupViewSet)
router.register(r'group-memberships', GroupMembershipViewSet)

urlpatterns = [
    path('availability/', UserEventListCreateView.as_view(), name='user-event-list'),
    path('availability/<int:pk>/', UserEventDetailView.as_view(), name='user-event-detail'),
    path("availability/filter/", FilteredUserEventView.as_view(), name="filtered-user-events"),
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('', include(router.urls)),
]
