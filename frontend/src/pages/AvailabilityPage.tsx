import { AvailabilityGrid } from "@/components/AvailabilityGrid";
import { useEffect, useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { getAuthHeaders } from "@/api/authHeaders";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { UserEvent } from "@/interfaces";

const fetchAvailability = async (startDate: string, endDate: string, navigate: NavigateFunction) => {
  const res = await fetchWithAuth(`/api/events/?start_date=${startDate}&end_date=${endDate}`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, navigate);
  return res.json();
};

export default function AvailabilityPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const startDate = format(weekStart, "yyyy-MM-dd");
  const endDate = format(weekEnd, "yyyy-MM-dd");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedData = await fetchAvailability(startDate, endDate, navigate);
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching availability data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate, navigate]);

  const handleExtEventSave = async (event: UserEvent): Promise<UserEvent | null> => {
  const isEdit = !!event.id;
  const url = "/api/submit-event/";
  const method = isEdit ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(isEdit ? "Failed to update event" : "Failed to create event");
    }

    const savedEvent: UserEvent = await response.json(); // ✅ Parse the response

    console.log(isEdit ? "Event updated:" : "Event created:", savedEvent);

    const updatedData = await fetchAvailability(startDate, endDate, navigate);
    setData(updatedData);

    return savedEvent; // ✅ Return the created/updated event
  } catch (error) {
    console.error(isEdit ? "Failed to update event:" : "Failed to create event:", error);
    return null;
  }
};

const handleDeleteEvent = async (id: number) => {
  try {
    const response = await fetch("/api/submit-event/", {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) throw new Error("Failed to delete event");

    console.log("Event deleted");
    const updatedData = await fetchAvailability(startDate, endDate, navigate);
    setData(updatedData);
  } catch (error) {
    console.error("Error deleting event:", error);
  }
};

const handleAddToGoogleCalendar = async (event: UserEvent) => {
  const token = localStorage.getItem("googleAccessToken");
  console.log("Event :", event);
  if (!token) {
    console.error("Missing Google access token");
    return;
  }

  const start = new Date(`${event.date}T${event.start_time}`).toISOString();
  const end = new Date(`${event.date}T${event.end_time}`).toISOString();

  await fetch("/api/add-to-google-calendar/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      token,
      event: {
        id: event.id,
        title: event.description,
        description: event.description,
        location: event.location,
        start,
        end,
        google_event_id: event.google_event_id,
      },
    }),
  });
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-700">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="p-4">
          <AvailabilityGrid
            onEventDelete={handleDeleteEvent}
            onExtEventCreate={handleExtEventSave}
            eventData={data}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onAddToGoogleCalendar={handleAddToGoogleCalendar}
          />
        </div>
      )}
    </div>
  );
}
