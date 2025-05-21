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

            # Create or get user
            user, created = User.objects.get_or_create(email=email, defaults={"username": username})

            # Issue your app's JWT
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
    
class EventSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UserEventSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            events = serializer.save()
            return Response({"message": f"{len(events)} events created."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class UserEventListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date = parse_date(request.GET.get('start_date'))
        end_date = parse_date(request.GET.get('end_date'))

        # Get all groups where the user is a member
        user_group_ids = GroupMembership.objects.filter(user=user).values_list('group_id', flat=True)

        # Filter events
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

        # Try to find the user in your DB, or create them
        user, created = User.objects.get_or_create(email=email, defaults={"username": email})

        # Return your own app's response (JWT, session, etc.)
        return user
    except Exception as e:
        print("Firebase verification failed:", str(e))
        return None