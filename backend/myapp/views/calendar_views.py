from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from myapp.models import UserEvent
from rest_framework.permissions import IsAuthenticated


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
