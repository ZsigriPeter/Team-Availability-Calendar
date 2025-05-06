import React, { useState } from 'react';
import { EventModal } from './EventModal';
import { UserEvent } from '@/interfaces';
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
} from 'date-fns';

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

interface TimeSlot {
  date: string;
  hour: string;
}

interface AvailabilityGridProps {
  onEventCreate: (event: { slots: TimeSlot[]; type: 'solo' | 'group'; description: string }) => void;
  eventData: UserEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  onEventCreate,
  eventData,
  currentDate,
  onDateChange,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const toggleSlot = (day: Date, hour: string) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const exists = selectedSlots.find(slot => slot.date === dateStr && slot.hour === hour);
    if (exists) {
      setSelectedSlots(prev => prev.filter(slot => !(slot.date === dateStr && slot.hour === hour)));
    } else {
      setSelectedSlots(prev => [...prev, { date: dateStr, hour }]);
    }
  };

  const handleConfirm = (type: 'solo' | 'group', description: string) => {
    onEventCreate({ slots: selectedSlots, type, description });
    setSelectedSlots([]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-4 bg-white dark:bg-gray-900 text-black dark:text-white p-2 rounded-md">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => onDateChange(subWeeks(currentDate, 1))}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Previous Week
          </button>
          <button
            onClick={() => onDateChange(addWeeks(currentDate, 1))}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Next Week
          </button>
        </div>

        <input
          type="date"
          value={format(currentDate, 'yyyy-MM-dd')}
          onChange={(e) => {
            const picked = new Date(e.target.value);
            onDateChange(startOfWeek(picked, { weekStartsOn: 1 }));
          }}
          className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full sm:table-fixed border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr>
              <th className="w-24"></th>
              {daysOfWeek.map(day => (
                <th key={day.toISOString()} className="text-center px-2 py-1 border border-gray-300 dark:border-gray-700">
                  {format(day, 'EEEE')}<br />{format(day, 'MM/dd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="w-16 px-1 text-[10px] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 text-right">{hour}</td>
                {daysOfWeek.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const selected = selectedSlots.some(slot => slot.date === dateStr && slot.hour === hour);
                  
                  const matchingEvent = eventData.find(event => {
                    const eventDate = parseISO(event.date);
                    const eventHour = format(parseISO(`${event.date}T${event.start_time}`), 'HH:00');
                    return isSameDay(eventDate, day) && eventHour === hour;
                  });

                  const hasEvent = !!matchingEvent;

                  return (
                    <td
                      key={day.toISOString() + hour}
                      className={`h-8 cursor-pointer border border-gray-300 dark:border-gray-700 relative
                        ${selected
                          ? 'bg-blue-400 dark:bg-blue-600'
                          : hasEvent
                            ? 'bg-green-300 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
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
