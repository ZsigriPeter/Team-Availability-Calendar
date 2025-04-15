import React, { useState } from 'react';
import { EventModal } from './EventModal';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

interface TimeSlot {
  day: string;
  hour: string;
}

interface AvailabilityGridProps {
  onEventCreate: (event: {
    slots: TimeSlot[];
    type: 'solo' | 'group';
    description: string;
  }) => void;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ onEventCreate }) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleSlot = (day: string, hour: string) => {
    const exists = selectedSlots.find(slot => slot.day === day && slot.hour === hour);
    if (exists) {
      setSelectedSlots(prev => prev.filter(slot => !(slot.day === day && slot.hour === hour)));
    } else {
      setSelectedSlots(prev => [...prev, { day, hour }]);
    }
  };

  const handleConfirm = (type: 'solo' | 'group', description: string) => {
    onEventCreate({ slots: selectedSlots, type, description });
    setSelectedSlots([]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table-fixed border-collapse w-full">
          <thead>
            <tr>
              <th className="w-24"></th>
              {days.map(day => (
                <th key={day} className="text-center px-2 py-1 border border-gray-300">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="text-right pr-2 text-sm text-gray-600 border border-gray-300">{hour}</td>
                {days.map(day => {
                  const selected = selectedSlots.some(slot => slot.day === day && slot.hour === hour);
                  return (
                    <td
                      key={day + hour}
                      className={`h-8 cursor-pointer border border-gray-300 ${selected ? 'bg-blue-400' : 'hover:bg-gray-200'}`}
                      onClick={() => toggleSlot(day, hour)}
                    ></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedSlots.length > 0 && (
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Event
        </button>
      )}
      {isModalOpen && (
        <EventModal
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};