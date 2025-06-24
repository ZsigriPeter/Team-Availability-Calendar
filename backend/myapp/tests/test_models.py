from django.test import TestCase
from django.contrib.auth.models import User
from ..models import Group, GroupMembership, UserEvent, EventParticipation
from django.utils.timezone import now, timedelta
from django.core.exceptions import ValidationError


class ModelTests(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.group = Group.objects.create(name='Test Group', owner=self.user1)

    def test_group_creation(self):
        self.assertEqual(self.group.name, 'Test Group')
        self.assertEqual(self.group.owner, self.user1)

    def test_groupmembership_creation_and_permissions(self):
        membership = GroupMembership.objects.create(user=self.user2, group=self.group, role='admin')
        self.assertTrue(membership.can_modify_events())
        self.assertTrue(membership.can_create_events())
        self.assertFalse(membership.can_delete_events())

    def test_groupmembership_uniqueness(self):
        GroupMembership.objects.create(user=self.user2, group=self.group)
        with self.assertRaises(Exception):  # IntegrityError wrapped in Django's test DB transaction
            GroupMembership.objects.create(user=self.user2, group=self.group)

    def test_userevent_validation_solo_without_user(self):
        event = UserEvent(
            type='solo',
            description='Solo Event',
            date=now().date(),
            start_time=now().time(),
            end_time=(now() + timedelta(hours=1)).time(),
            group=self.group
        )
        with self.assertRaises(ValidationError):
            event.clean()

    def test_userevent_validation_group_without_group(self):
        event = UserEvent(
            type='group',
            description='Group Event',
            date=now().date(),
            start_time=now().time(),
            end_time=(now() + timedelta(hours=1)).time(),
            user=self.user1
        )
        with self.assertRaises(ValidationError):
            event.clean()

    def test_user_can_edit_solo_event(self):
        event = UserEvent.objects.create(
            type='solo',
            description='Solo Event',
            date=now().date(),
            start_time=now().time(),
            end_time=(now() + timedelta(hours=1)).time(),
            user=self.user1,
            group=self.group
        )
        self.assertTrue(event.user_can_edit(self.user1))
        self.assertFalse(event.user_can_edit(self.user2))

    def test_user_can_edit_group_event_based_on_membership(self):
        GroupMembership.objects.create(user=self.user2, group=self.group, role='admin')
        event = UserEvent.objects.create(
            type='group',
            description='Group Event',
            date=now().date(),
            start_time=now().time(),
            end_time=(now() + timedelta(hours=1)).time(),
            group=self.group
        )
        self.assertTrue(event.user_can_edit(self.user2))
        self.assertFalse(event.user_can_edit(self.user1))  # Not a member

    def test_eventparticipation_uniqueness(self):
        event = UserEvent.objects.create(
            type='group',
            description='Group Event',
            date=now().date(),
            start_time=now().time(),
            end_time=(now() + timedelta(hours=1)).time(),
            group=self.group
        )
        EventParticipation.objects.create(user=self.user1, event=event, response='yes')
        with self.assertRaises(Exception):
            EventParticipation.objects.create(user=self.user1, event=event)

    def test_eventparticipation_str(self):
        event = UserEvent.objects.create(
            type='group',
            description='Group Event',
            date=now().date(),
            start_time=now().time(),
            end_time=(now() + timedelta(hours=1)).time(),
            group=self.group
        )
        participation = EventParticipation.objects.create(user=self.user1, event=event, response='maybe')
        expected = f"{self.user1.username} - {str(event)} → Maybe"
        self.assertEqual(str(participation), expected)
