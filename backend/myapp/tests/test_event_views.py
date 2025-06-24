from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch
from datetime import date, time
from myapp.models import UserEvent, Group, GroupMembership

User = get_user_model()

def create_user(username="user", email="test@example.com", password="pass1234"):
    return User.objects.create_user(username=username, email=email, password=password)

def authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

class FilteredUserEventTests(TestCase):
    def setUp(self):
        self.user = create_user(username="alice")
        self.client = APIClient()

    def test_filtered_user_events_returns_solo_events(self):
        event = UserEvent.objects.create(
            user=self.user,
            type='solo',
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(11, 0),
            description="Test Event"
        )

        url = reverse('filtered-user-events')
        response = self.client.get(url, {
            'id': self.user.id,
            'start_date': str(date.today()),
            'end_date': str(date.today())
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class GroupEventSubmissionTests(TestCase):
    def setUp(self):
        self.user = create_user("bob")
        self.group = Group.objects.create(name="Test Group")
        self.membership = GroupMembership.objects.create(
            user=self.user, group=self.group, role='owner'
        )
        self.client = authenticated_client(self.user)

    @patch('myapp.views.event_views.send_mass_mail')
    def test_create_group_event_success(self, mock_send):
        additional_user = create_user("alice", email="alice@example.com")
        GroupMembership.objects.create(user=additional_user, group=self.group, role='member')

        url = reverse('submit-event')
        payload = {
            "type": "group",
            "group": self.group.id,
            "date": str(date.today()),
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "description": "Group event",
        }
        response = self.client.post(url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserEvent.objects.filter(group=self.group).exists())
        mock_send.assert_called()

    def test_create_group_event_no_permission(self):
        other_user = create_user("hacker")
        client = authenticated_client(other_user)

        url = reverse('submit-event')
        payload = {
            "type": "group",
            "group": self.group.id,
            "date": str(date.today()),
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "description": "Bad guy's event",
        }
        response = client.post(url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_own_solo_event(self):
        event = UserEvent.objects.create(
            user=self.user,
            type='solo',
            date=date.today(),
            start_time="10:00",
            end_time="11:00",
            description="Old",
        )
        url = reverse('submit-event')
        data = {
            "id": event.id,
            "type": "solo",
            "date": str(date.today()),
            "start_time": "11:00:00",
            "end_time": "12:00:00",
            "description": "Updated"
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        event.refresh_from_db()
        self.assertEqual(event.description, "Updated")

    def test_delete_group_event_unauthorized(self):
        event = UserEvent.objects.create(
            type='group',
            group=self.group,
            date=date.today(),
            start_time="10:00",
            end_time="11:00",
            description="Protected"
        )
        client = authenticated_client(create_user("nope"))
        url = reverse('submit-event')
        response = client.delete(url, {"id": event.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

