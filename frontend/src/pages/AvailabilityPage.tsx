// src/pages/AvailabilityPage.tsx
import { AvailabilityGrid } from "@/components/AvailabilityGrid";
import { useEffect,useState } from "react";

const handleEventCreate = (event: {
    slots: { day: string; hour: string }[];
    type: 'solo' | 'group';
    description: string;
  }) => {
    fetch('/api/availability/', {
      method: 'POST',
      body: JSON.stringify(event),
    }).then(response => console.log('Event saved:', response));
  };

//http://127.0.0.1:8000/api/availability/filter/?id=1&start_date=2025-04-10&end_date=2025-04-16
const fetchAvailability = async (userId: number, startDate:string, endDate:string) => {
  const response = await fetch(`/api/availability/filter/?id=${userId}&start_date=${startDate}&end_date=${endDate}`);
  if (!response.ok) {
    throw new Error('Failed to fetch availability data');
  }
  return response.json();
}

export default function AvailabilityPage() {
  const [userId,setUserId] = useState(1); // Replace with actual user ID
  const [startDate,setStartDate] = useState('2025-04-14'); // Replace with actual start date
  const [endDate,setEndDate] = useState('2025-04-20'); // Replace with actual end date

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fechedData = await fetchAvailability(userId, startDate, endDate);
        setData(fechedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching availability data:', error);
      }
    };
    fetchData();
  }, [userId, startDate, endDate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Weekly Availability</h1>
      <AvailabilityGrid onEventCreate={handleEventCreate} eventData={data} />
    </div>
      )}
    </div>
    
  );
}