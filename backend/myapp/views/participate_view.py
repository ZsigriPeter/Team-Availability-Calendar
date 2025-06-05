from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models import GroupMembership, UserEvent, EventParticipation
from ..serializers import EventParticipationSerializer

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def respond_to_event(request, event_id):
    user = request.user
    response_value = request.data.get("response")

    if response_value not in ["yes", "no", "maybe"]:
        return Response({"error": "Invalid response"}, status=400)

    try:
        event = UserEvent.objects.get(id=event_id)
    except UserEvent.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)

    if event.type != "group":
        return Response({"error": "Only group events support participation responses."}, status=400)

    if not GroupMembership.objects.filter(user=user, group=event.group).exists():
        return Response({"error": "You are not a member of this group."}, status=403)

    participation, created = EventParticipation.objects.get_or_create(
        user=user,
        event=event,
        defaults={"response": response_value}
    )

    if not created:
        participation.response = response_value
        participation.save()

    serializer = EventParticipationSerializer(participation)
    return Response(serializer.data, status=200)

