from ..models import Group, GroupMembership
from ..serializers import GroupSerializer, GroupMembershipSerializer
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        user_groups = GroupMembership.objects.filter(user=self.request.user).values_list('group_id', flat=True)
        return Group.objects.exclude(id__in=user_groups)

    def perform_create(self, serializer):
        group = serializer.save(owner=self.request.user)
        GroupMembership.objects.create(user=self.request.user, group=group, role='owner')

class GroupMembershipViewSet(viewsets.ModelViewSet):
    queryset = GroupMembership.objects.all()
    serializer_class = GroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group(request, group_id):
    user = request.user

    group = get_object_or_404(Group, id=group_id)

    if GroupMembership.objects.filter(user=user, group=group).exists():
        return Response({"detail": "Already a member of this group."}, status=status.HTTP_400_BAD_REQUEST)

    GroupMembership.objects.create(user=user, group=group)

    return Response({"detail": "Joined group successfully."}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    user = request.user

    group = get_object_or_404(Group, id=group_id)

    try:
        membership = GroupMembership.objects.get(user=user, group=group)
    except GroupMembership.DoesNotExist:
        return Response({"detail": "You are not a member of this group."}, status=status.HTTP_400_BAD_REQUEST)

    membership.delete()

    return Response({"detail": "Left group successfully."}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_user_from_group(request, group_id, user_id):
    requester = request.user
    group = get_object_or_404(Group, id=group_id)

    try:
        requester_membership = GroupMembership.objects.get(user=requester, group=group)
    except GroupMembership.DoesNotExist:
        return Response({"detail": "You are not a member of this group."}, status=status.HTTP_403_FORBIDDEN)

    if requester_membership.role != 'owner':
        return Response({"detail": "Only the group owner can remove users."}, status=status.HTTP_403_FORBIDDEN)

    if requester.id == user_id:
        return Response({"detail": "Owner cannot remove themselves."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_membership = GroupMembership.objects.get(user_id=user_id, group=group)
    except GroupMembership.DoesNotExist:
        return Response({"detail": "Target user is not a member of this group."}, status=status.HTTP_404_NOT_FOUND)

    target_membership.delete()
    return Response({"detail": "User removed from group."}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_groups(request):
    user = request.user
    memberships = GroupMembership.objects.filter(user=user).select_related('group')
    groups = [membership.group for membership in memberships]
    serializer = GroupSerializer(groups, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_group_role(request):
    group_id = request.query_params.get('group_id')
    user_id = request.query_params.get('user_id')

    if not group_id or not user_id:
        return Response({"error": "Missing group_id or user_id"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        membership = GroupMembership.objects.get(group_id=group_id, user_id=user_id)
        return Response({"role": membership.role}, status=status.HTTP_200_OK)
    except GroupMembership.DoesNotExist:
        return Response({"error": "User is not a member of this group"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group_members(request, group_id):
    group = get_object_or_404(Group, id=group_id)

    memberships = GroupMembership.objects.filter(group=group).select_related('user')
    serialized_members = [
        {
            "id": membership.user.id,
            "username": membership.user.username,
            "role": membership.role
        }
        for membership in memberships
    ]
    return Response(serialized_members, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_group(request, group_id):
    try:
        group = Group.objects.get(id=group_id)

        if group.owner != request.user:
            return Response({"error": "Permission denied"}, status=403)

        group.delete()
        return Response({"success": "Group deleted"}, status=204)

    except Group.DoesNotExist:
        return Response({"error": "Group not found"}, status=404)
    
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_role_in_group(request, group_id, user_id):
    requester = request.user
    group = get_object_or_404(Group, id=group_id)

    try:
        requester_membership = GroupMembership.objects.get(user=requester, group=group)
        if requester_membership.role != 'owner':
            return Response({"detail": "Only the group owner can update roles."}, status=status.HTTP_403_FORBIDDEN)
    except GroupMembership.DoesNotExist:
        return Response({"detail": "You are not a member of this group."}, status=status.HTTP_403_FORBIDDEN)

    if requester.id == user_id:
        return Response({"detail": "Group owner cannot change their own role."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        membership = GroupMembership.objects.get(user_id=user_id, group=group)
    except GroupMembership.DoesNotExist:
        return Response({"detail": "User is not a member of this group."}, status=status.HTTP_404_NOT_FOUND)

    new_role = request.data.get("role")
    if new_role not in ["member", "admin"]:
        return Response({"detail": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)

    membership.role = new_role
    membership.save()

    return Response({"detail": f"Role updated to {new_role}."}, status=status.HTTP_200_OK)


