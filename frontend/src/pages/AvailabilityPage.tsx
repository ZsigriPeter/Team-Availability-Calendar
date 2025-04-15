// src/pages/AvailabilityPage.tsx
import { AvailabilityGrid } from "@/components/AvailabilityGrid";

// Define the handleEventCreate function
const handleEventCreate = (event: {
    slots: { day: string; hour: string }[];
    type: 'solo' | 'group';
    description: string;
  }) => {
    fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }).then(response => console.log('Event saved:', response));
  };

export default function AvailabilityPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Weekly Availability</h1>
      <AvailabilityGrid onEventCreate={handleEventCreate} />
    </div>
  );
}