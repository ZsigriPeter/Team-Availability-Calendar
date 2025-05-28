import json
from django.shortcuts import render
from rest_framework import generics, viewsets, permissions, filters,status
from .models import UserEvent, Group, GroupMembership,User
from .serializers import UserEventSerializer, GroupSerializer, UserSerializer, GroupMembershipSerializer, EventSubmissionSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.db.models import Q
from firebase_admin import auth as firebase_auth
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt

import requests

User = get_user_model()

class GoogleLoginView(APIView):
    def post(self, request):
        id_token = request.data.get("idToken")
        if not id_token:
            return Response({"detail": "ID token required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            email = decoded_token.get('email')
            username = decoded_token.get('name', email)
            uid = decoded_token.get('uid')

            if not email:
                return Response({"detail": "Email not found in token."}, status=status.HTTP_400_BAD_REQUEST)

            user, created = User.objects.get_or_create(email=email, defaults={"username": username})

            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })

        except Exception as e:
            print("Firebase error:", e)
            return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)

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
    
class UserDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_groups(request):
    user = request.user
    memberships = GroupMembership.objects.filter(user=user).select_related('group')
    groups = [membership.group for membership in memberships]
    serializer = GroupSerializer(groups, many=True)
    return Response(serializer.data)

class EventSlotSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = EventSubmissionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            events = serializer.save()
            return Response({"message": f"{len(events)} events created."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from .serializers import UserEventSerializer

class EventSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UserEventSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            event = serializer.save()
            return Response(UserEventSerializer(event).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        event_id = request.data.get("id")
        if not event_id:
            return Response({"error": "Missing 'id' for update."}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(UserEvent, id=event_id)

        if event.user and event.user != request.user:
            return Response({"error": "You don't have permission to edit this event."}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserEventSerializer(event, data=request.data, context={'request': request})
        if serializer.is_valid():
            event = serializer.save()
            return Response(UserEventSerializer(event).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        event_id = request.data.get("id")
        if not event_id:
            return Response({"error": "Missing 'id' for delete."}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(UserEvent, id=event_id)

        if event.user and event.user != request.user:
            return Response({"error": "You don't have permission to delete this event."}, status=status.HTTP_403_FORBIDDEN)

        event.delete()
        return Response({"message": "Event deleted."}, status=status.HTTP_204_NO_CONTENT)
    
    
class UserEventListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date = parse_date(request.GET.get('start_date'))
        end_date = parse_date(request.GET.get('end_date'))

        user_group_ids = GroupMembership.objects.filter(user=user).values_list('group_id', flat=True)

        events = UserEvent.objects.filter(
            Q(type='solo', user=user) |
            Q(type='group', group_id__in=user_group_ids)
        ).filter(
            date__range=(start_date, end_date)
        )

        serializer = UserEventSerializer(events, many=True)
        return Response(serializer.data)
    
def authenticate_firebase_token(token):
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email')

        user, created = User.objects.get_or_create(email=email, defaults={"username": email})

        return user
    except Exception as e:
        print("Firebase verification failed:", str(e))
        return None
    
    
@api_view(["POST"])
def add_to_google_calendar(request):
    token = request.data.get("token")
    event = request.data.get("event")

    if not token or not event:
        return Response({"error": "Missing token or event"}, status=400)

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    event_data = {
        "summary": event["title"],
        "description": event["description"],
        "start": {
            "dateTime": event["start"],
            "timeZone": "Europe/Budapest"
        },
        "end": {
            "dateTime": event["end"],
            "timeZone": "Europe/Budapest"
        }
    }

    google_event_id = event.get("google_event_id")

    if google_event_id:
        response = requests.patch(
            f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{google_event_id}",
            headers=headers,
            json=event_data
        )
    else:
        response = requests.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            headers=headers,
            json=event_data
        )

        if response.status_code in (200, 201):
            google_event_id = response.json().get("id")
            
            try:
                user_event = UserEvent.objects.get(id=event.get("id"))
                user_event.google_event_id = google_event_id
                user_event.save()
            except UserEvent.DoesNotExist:
                print(f"UserEvent with id={event.get('id')} not found")

    return Response(response.json(), status=response.status_code)

@api_view(["POST"])
def delete_from_google_calendar(request):
    token = request.data.get("token")
    google_event_id = request.data.get("google_event_id")

    if not token or not google_event_id:
        return Response({"error": "Missing token or google_event_id"}, status=400)

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.delete(
        f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{google_event_id}",
        headers=headers
    )

    if response.status_code == 204:
        try:
            user_event = UserEvent.objects.get(google_event_id=google_event_id)
            user_event.google_event_id = None
            user_event.save()
        except UserEvent.DoesNotExist:
            pass

        return Response({"message": "Deleted from Google Calendar"}, status=204)
    else:
        return Response(response.json(), status=response.status_code)


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


