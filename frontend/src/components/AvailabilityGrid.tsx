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
    <div className="space-y-4 bg-white dark:bg-gray-900 text-black dark:text-white p-2 rounded-md">
      <div className="w-full overflow-x-auto">
      <table className="w-full sm:table-fixed border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr>
              <th className="w-24"></th>
              {days.map(day => (
                <th key={day} className="text-center px-2 py-1 border border-gray-300 dark:border-gray-700">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="w-16 px-1 text-[10px] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 text-right">{hour}</td>
                {days.map(day => {
                  const selected = selectedSlots.some(slot => slot.day === day && slot.hour === hour);

                  const matchingEvent = eventData.find(event => {
                    const eventDay = getDayName(event.date);
                    const eventHour = event.start_time.slice(0, 5);
                    return eventDay === day && eventHour === hour;
                  });

                  const hasEvent = !!matchingEvent;

                  return (
                    <td
                      key={day + hour}
                      className={`h-8 cursor-pointer border border-gray-300 dark:border-gray-700 relative
                        ${selected
                          ? 'bg-blue-400 dark:bg-blue-600'
                          : hasEvent
                            ? 'bg-green-300 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
                      `}
                      onClick={() => toggleSlot(day, hour)}
                    >
                      {hasEvent && (
                        <div className="text-[10px] text-gray-800 dark:text-gray-100 truncate px-1 whitespace-nowrap overflow-hidden">
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
