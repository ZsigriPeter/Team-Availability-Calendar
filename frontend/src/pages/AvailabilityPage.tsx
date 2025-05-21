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

  const handleEventCreate = async (event: {
    slots: { date: string; hour_start: string; hour_end:string }[];
    type: "solo" | "group";
    description: string;
    groupId?: string;
  }) => {
    try {
      const response = await fetch("/api/submit-events/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error("Failed to save event");
      console.log("Event saved:", response);
      const updatedData = await fetchAvailability( startDate, endDate, navigate);
      setData(updatedData);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleExtEventCreate = async (event: UserEvent) => {
    try {
      const response = await fetch("/api/submit-event/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error("Failed to save event");
      console.log("Event saved:", response);
      const updatedData = await fetchAvailability( startDate, endDate, navigate);
      setData(updatedData);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-700">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="p-4">
          <AvailabilityGrid
            onEventCreate={handleEventCreate}
            onExtEventCreate={handleExtEventCreate}
            eventData={data}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>
      )}
    </div>
  );
}
