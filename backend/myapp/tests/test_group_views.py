from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from myapp.models import Group, GroupMembership

class GroupViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='bob', password='pass')
        self.other_user = User.objects.create_user(username='alice', password='pass')
        self.client.force_authenticate(user=self.user)
        
        self.group = Group.objects.create(name='Test Group', owner=self.user)
        GroupMembership.objects.create(user=self.user, group=self.group, role='owner')


    def test_join_group_success(self):
        url = f'/api/groups/{self.group.id}/join/'
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(GroupMembership.objects.filter(user=self.other_user, group=self.group).exists())

    def test_join_group_already_member(self):
        GroupMembership.objects.create(user=self.other_user, group=self.group)
        url = f'/api/groups/{self.group.id}/join/'
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, 400)

    def test_leave_group_success(self):
        GroupMembership.objects.create(user=self.other_user, group=self.group)
        url = f'/api/groups/{self.group.id}/leave/'
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(GroupMembership.objects.filter(user=self.other_user, group=self.group).exists())

    def test_leave_group_not_member(self):
        url = f'/api/groups/{self.group.id}/leave/'
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, 400)

    def test_owner_can_remove_user(self):
        GroupMembership.objects.create(user=self.other_user, group=self.group)
        url = f'/api/groups/{self.group.id}/members/{self.other_user.id}/remove/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(GroupMembership.objects.filter(user=self.other_user, group=self.group).exists())

    def test_owner_cannot_remove_self(self):
        url = f'/api/groups/{self.group.id}/members/{self.user.id}/remove/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 400)

    def test_update_user_role_success(self):
        GroupMembership.objects.create(user=self.other_user, group=self.group)
        url = f'/api/groups/{self.group.id}/members/{self.other_user.id}/role'
        response = self.client.put(url, {'role': 'admin'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(GroupMembership.objects.get(user=self.other_user, group=self.group).role, 'admin')

    def test_owner_cannot_change_own_role(self):
        url = f'/api/groups/{self.group.id}/members/{self.user.id}/role'
        response = self.client.put(url, {'role': 'admin'})
        self.assertEqual(response.status_code, 400)

    def test_owner_can_delete_group(self):
        url = f'/api/groups/{self.group.id}/delete/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Group.objects.filter(id=self.group.id).exists())

    def test_non_owner_cannot_delete_group(self):
        self.client.force_authenticate(user=self.other_user)
        url = f'/api/groups/{self.group.id}/delete/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)
