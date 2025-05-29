from ..models import UserEvent, GroupMembership
from ..serializers import UserEventSerializer, EventSubmissionSerializer
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated


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
    

