from django.conf import settings
from ..models import EventParticipation, Group, UserEvent, GroupMembership
from ..serializers import UserEventSerializer, EventSubmissionSerializer
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mass_mail


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

    def _get_group_member_emails(self, group):
        """Get email addresses of all group members except the requesting user."""
        return list(GroupMembership.objects.filter(group=group)
                   .exclude(user=self.request.user)
                   .select_related('user')
                   .values_list('user__email', flat=True))

    def _send_group_event_notification(self, event, action):
        """Send email notification to group members about event actions."""
        if event.type != 'group' or not event.group:
            print(f"No notification sent for event {event.id}: Not a group event or no group specified")
            return

        subject = f"Group Event {action}: {event.description}"
        message = (
            f"A group event has been {action.lower()}:\n\n"
            f"Event: {event.description}\n"
            f"Date: {event.date}\n"
            f"Time: {event.start_time} - {event.end_time}\n"
            f"Location: {event.location or 'Not specified'}\n"
            f"Modified by: {self.request.user.username}"
        )
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = self._get_group_member_emails(event.group)
        print(f"Attempting to send emails for event {event.id} to: {recipient_list}")

        if recipient_list:
            messages = [(subject, message, from_email, [email]) for email in recipient_list]
            try:
                sent = send_mass_mail(messages, fail_silently=False)

                print(f"Sent {sent} email notifications for event {event.id}")
            except Exception as e:
                print(f"Failed to send email notifications for event {event.id}: {str(e)}")
        else:
            print(f"No recipients found for event {event.id} notification")

    def _create_participation_records(self, event):
        """Create EventParticipation records for group members."""
        if event.type != 'group' or not event.group:
            return

        members = GroupMembership.objects.filter(group=event.group).exclude(user=self.request.user)
        for membership in members:
            EventParticipation.objects.get_or_create(
                user=membership.user,
                event=event,
                defaults={'response': 'maybe'}
            )
            print(f"Created participation record for {membership.user.username} in event {event.id}")

    def post(self, request):
        serializer = UserEventSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            event_type = serializer.validated_data.get('type')
            group = serializer.validated_data.get('group')

            if event_type == 'group':
                if not group:
                    return Response({"error": "Group event must have a group."}, status=status.HTTP_400_BAD_REQUEST)
                # Validate group exists
                if not Group.objects.filter(id=group.id).exists():
                    return Response({"error": "Specified group does not exist."}, status=status.HTTP_400_BAD_REQUEST)

                membership = GroupMembership.objects.filter(user=request.user, group=group).first()
                if not membership or not membership.can_create_events():
                    return Response({"error": "You don't have permission to create group events."},
                                    status=status.HTTP_403_FORBIDDEN)

            # Set user only for solo events
            user = request.user if event_type == 'solo' else None
            event = serializer.save(user=user)
            self._create_participation_records(event)
            self._send_group_event_notification(event, "Created")
            return Response(UserEventSerializer(event).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        event_id = request.data.get("id")
        if not event_id:
            return Response({"error": "Missing 'id' for update."}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(UserEvent, id=event_id)

        if event.type == 'solo':
            if event.user != request.user:
                return Response({"error": "You don't have permission to edit this solo event."},
                                status=status.HTTP_403_FORBIDDEN)
        elif event.type == 'group':
            if not event.group or not Group.objects.filter(id=event.group.id).exists():
                return Response({"error": "Associated group does not exist."}, status=status.HTTP_400_BAD_REQUEST)
            membership = GroupMembership.objects.filter(user=request.user, group=event.group).first()
            if not membership or not membership.can_modify_events():
                return Response({"error": "You don't have permission to edit this group event."},
                                status=status.HTTP_403_FORBIDDEN)

        serializer = UserEventSerializer(event, data=request.data, context={'request': request})
        if serializer.is_valid():
            # Set user only for solo events
            user = request.user if serializer.validated_data.get('type') == 'solo' else None
            updated_event = serializer.save(user=user)
            self._send_group_event_notification(updated_event, "Updated")
            return Response(UserEventSerializer(updated_event).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        event_id = request.data.get("id")
        if not event_id:
            return Response({"error": "Missing 'id' for delete."}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(UserEvent, id=event_id)

        if event.type == 'solo':
            if event.user != request.user:
                return Response({"error": "You don't have permission to delete this solo event."},
                                status=status.HTTP_403_FORBIDDEN)
        elif event.type == 'group':
            if not event.group or not Group.objects.filter(id=event.group.id).exists():
                return Response({"error": "Associated group does not exist."}, status=status.HTTP_400_BAD_REQUEST)
            membership = GroupMembership.objects.filter(user=request.user, group=event.group).first()
            if not membership or not membership.can_delete_events():
                return Response({"error": "Only group owners can delete this group event."},
                                status=status.HTTP_403_FORBIDDEN)

        self._send_group_event_notification(event, "Deleted")
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
    

