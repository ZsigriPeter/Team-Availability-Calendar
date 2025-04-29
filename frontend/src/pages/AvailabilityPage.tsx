import { AvailabilityGrid } from "@/components/AvailabilityGrid";
import { useEffect, useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import { getUserData } from "@/api/userData";

const fetchAvailability = async (userId: number, startDate: string, endDate: string) => {
  const response = await fetch(`/api/availability/filter/?id=${userId}&start_date=${startDate}&end_date=${endDate}`);
  if (!response.ok) {
    throw new Error("Failed to fetch availability data");
  }
  return response.json();
};

export default function AvailabilityPage() {
  const [userId, setUserId] = useState(1); // Replace with actual user ID
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
        const userData = await getUserData();
        console.log("userData", userData);
        setUserId(userData.id);
        const fetchedData = await fetchAvailability(userId, startDate, endDate);
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching availability data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, startDate, endDate]);

  const handleEventCreate = async (event: {
    slots: { date: string; hour: string }[];
    type: "solo" | "group";
    description: string;
  }) => {
    try {
      const response = await fetch("/api/availability/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error("Failed to save event");
      console.log("Event saved:", response);
      // Refetch after creation
      const updatedData = await fetchAvailability(userId, startDate, endDate);
      setData(updatedData);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="p-4">
          <AvailabilityGrid
            onEventCreate={handleEventCreate}
            eventData={data}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>
      )}
    </div>
  );
}
