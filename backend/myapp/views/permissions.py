from rest_framework import permissions
from ..models import GroupMembership, UserEvent

class IsGroupAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.type == 'group' and obj.group:
            membership = GroupMembership.objects.filter(user=request.user, group=obj.group).first()
            return membership and membership.can_modify_events()
        return False

class IsEventOwnerOrGroupAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.type == 'solo':
            return obj.user == request.user
        if obj.type == 'group':
            membership = GroupMembership.objects.filter(user=request.user, group=obj.group).first()
            return membership and membership.can_modify_events()
        return False

class CanDeleteGroupEvent(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.type == 'group':
            membership = GroupMembership.objects.filter(user=request.user, group=obj.group).first()
            return membership and membership.can_delete_events()
        return False
    