from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'group-memberships', GroupMembershipViewSet)
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('availability/', UserEventListCreateView.as_view(), name='user-event-list'),
    path('availability/<int:pk>/', UserEventDetailView.as_view(), name='user-event-detail'),
    path('availability/filter/', FilteredUserEventView.as_view(), name="filtered-user-events"),
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('groups/<int:group_id>/join/', views.join_group, name='join-group'),
    path('groups/<int:group_id>/leave/', views.leave_group, name='leave-group'),
    path('user-data/', UserDataView.as_view(), name='user-data'),
    path('groups/my-groups/', views.my_groups, name='my-groups'),
    path('', include(router.urls)),
]
