from django.shortcuts import render
from rest_framework import generics, viewsets, permissions, filters
from .models import UserEvent, Group, GroupMembership
from .serializers import UserEventSerializer, GroupSerializer, UserSerializer, GroupMembershipSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserEventListCreateView(generics.ListCreateAPIView):
    queryset = UserEvent.objects.all()
    serializer_class = UserEventSerializer

class UserEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserEvent.objects.all()
    serializer_class = UserEventSerializer

class FilteredUserEventView(APIView):
    def get(self, request, format=None):
        user_id = request.query_params.get('id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not user_id or not start_date or not end_date:
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

        user_events = UserEvent.objects.filter(
            type='solo',
            user_id=user_id,
            date__range=[start_date, end_date]
        )
        serializer = UserEventSerializer(user_events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_id(request, username):
    try:
        user = User.objects.get(username=username)
        return Response({"id": user.id, "username": user.username})
    except User.DoesNotExist:
        return Response({"detail": "No User found"}, status=status.HTTP_404_NOT_FOUND)
    
    