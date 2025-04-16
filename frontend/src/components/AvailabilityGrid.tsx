import React, { useState } from 'react';
import { EventModal } from './EventModal';
import { UserEvent } from '../../interfaces';
import { format, parseISO } from 'date-fns';

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
  eventData: UserEvent[];
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ onEventCreate, eventData }) => {
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

  const getDayName = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'EEEE'); // returns 'Monday', 'Tuesday', etc.
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

                  // Match event data
                  const matchingEvent = eventData.find(event => {
                    const eventDay = getDayName(event.date);
                    const eventHour = event.start_time.slice(0, 5); // 'HH:MM'
                    return eventDay === day && eventHour === hour;
                  });

                  const hasEvent = !!matchingEvent;

                  return (
                    <td
                      key={day + hour}
                      className={`h-8 cursor-pointer border border-gray-300 relative
                        ${selected ? 'bg-blue-400' : hasEvent ? 'bg-green-300 hover:bg-green-400' : 'hover:bg-gray-200'}`}
                      onClick={() => toggleSlot(day, hour)}
                    >
                      {hasEvent && (
                        <div className="text-[10px] text-gray-800 truncate px-1">
                          {matchingEvent?.description}
                        </div>
                      )}
                    </td>
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
