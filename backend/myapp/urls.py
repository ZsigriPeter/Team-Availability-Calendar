from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'group-memberships', views.GroupMembershipViewSet)
router.register(r'groups', views.GroupViewSet, basename='group')

urlpatterns = [
    path('availability/', views.UserEventListCreateView.as_view(), name='user-event-list'),
    path('availability/<int:pk>/', views.UserEventDetailView.as_view(), name='user-event-detail'),
    path('availability/filter/', views.FilteredUserEventView.as_view(), name="filtered-user-events"),
    path('register/', views.UserCreateView.as_view(), name='user-register'),
    path('groups/<int:group_id>/join/', views.join_group, name='join-group'),
    path('groups/<int:group_id>/leave/', views.leave_group, name='leave-group'),
    path('groups/<int:group_id>/delete/', views.delete_group, name='delete-group'),
    path('groups/<int:group_id>/members/', views.get_group_members, name='get_group_members'),
    path('user-data/', views.UserDataView.as_view(), name='user-data'),
    path('groups/my-groups/', views.my_groups, name='my-groups'),
    path('submit-events/', views.EventSlotSubmissionView.as_view(), name='submit-events'),
    path('submit-event/', views.EventSubmissionView.as_view(), name='submit-events'),
    path('events/', views.UserEventListView.as_view(), name='user-event-list'),
    path('google-login/', views.GoogleLoginView.as_view(), name='google-login'),
    path('add-to-google-calendar/', views.add_to_google_calendar, name='google-calendar'),
    path('delete-google-calendar/', views.delete_from_google_calendar, name='google-calendar-delete'),
    path('group-role/', views.get_user_group_role, name='get_user_group_role'),
    path('events/<int:event_id>/respond/', views.respond_to_event, name='respond-to-event'),
    path('', include(router.urls)),
]
