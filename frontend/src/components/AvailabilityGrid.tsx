import React, { useEffect, useState } from 'react';
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
import { useNavigate } from "react-router-dom";
import { TimeSlot } from '@/interfaces';

import { getMyGroups } from '@/api/groups';
import { EventModalExtended } from './EventModalExtended';

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

interface AvailabilityGridProps {
  onEventCreate: (event: {
    slots: TimeSlot[];
    type: 'solo' | 'group';
    description: string;
    groupId?: string;
  }) => void;
  onExtEventCreate: (event: UserEvent) => void;
  eventData: UserEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  onEventCreate,
  onExtEventCreate,
  eventData,
  currentDate,
  onDateChange,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalExtOpen, setModalExtOpen] = useState(false);
  const [myGroups, setMyGroups] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getMyGroups(navigate);
      setMyGroups(groups);
    };
    fetchGroups();
  }
  , [navigate]);

  const toggleSlot = (day: Date, hour_start: string, hour_end:string ) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const exists = selectedSlots.find(slot => slot.date === dateStr && slot.hour_start === hour_start && slot.hour_end === hour_end);
    if (exists) {
      setSelectedSlots(prev => prev.filter(slot => !(slot.date === dateStr && slot.hour_start === hour_start && slot.hour_end === hour_end)));
    } else {
      setSelectedSlots(prev => [...prev, { date: dateStr, hour_start, hour_end }]);
    }
  };

  const handleConfirm = (
    type: 'solo' | 'group',
    description: string,
    groupId?: string
  ) => {
    onEventCreate({
      slots: selectedSlots,
      type,
      description,
      ...(type === 'group' && groupId ? { groupId } : {})
    });
    
    setSelectedSlots([]);
    setModalOpen(false);
  };

  const handleExtConfirm = (
    type: 'solo' | 'group',
    description: string,
    eventDate: string,
    eventTimeStart: string,
    eventTimeEnd: string,
    eventLocation?: string,
    group?: string
  ) => {
    onExtEventCreate({
      type,
      description,
      date: eventDate,
      start_time: eventTimeStart,
      end_time: eventTimeEnd,
      location: eventLocation,
      id: 0,
      user: null,
      group: group ? parseInt(group) : null,
      created_at: '',
      updated_at: ''
    });
    
    setModalExtOpen(false);
  };
  
  const groupColors: Record<number, string> = {
    1: 'bg-purple-300 dark:bg-purple-600 hover:bg-purple-400 dark:hover:bg-purple-500',
    2: 'bg-yellow-300 dark:bg-yellow-600 hover:bg-yellow-400 dark:hover:bg-yellow-500',
    3: 'bg-pink-300 dark:bg-pink-600 hover:bg-pink-400 dark:hover:bg-pink-500',
    4: 'bg-red-300 dark:bg-red-600 hover:bg-red-400 dark:hover:bg-red-500',
    // fallback group color below
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
          <button
            onClick={() => setModalExtOpen(true)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Add Event
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
                  const selected = selectedSlots.some(slot => slot.date === dateStr && slot.hour_start === hour);

                  const matchingEvent = eventData.find(event => {
                    const eventDate = parseISO(event.date);
                    const eventHour = format(parseISO(`${event.date}T${event.start_time}`), 'HH:00');
                    return isSameDay(eventDate, day) && eventHour === hour;
                  });

                  const hasEvent = !!matchingEvent;

                  const bgClass = selected
                    ? 'bg-blue-400 dark:bg-blue-600'
                    : hasEvent
                      ? matchingEvent.type === 'solo'
                        ? 'bg-green-300 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500'
                        : matchingEvent.group !== null && groupColors[matchingEvent.group] 
                          ? groupColors[matchingEvent.group]
                          : 'bg-orange-300 dark:bg-orange-600 hover:bg-orange-400 dark:hover:bg-orange-500'

                      : 'hover:bg-gray-200 dark:hover:bg-gray-700';

                  return (
                    <td
                      key={day.toISOString() + hour}
                      className={`h-8 cursor-pointer border border-gray-300 dark:border-gray-700 relative ${bgClass}`}
                      onClick={() => {
                        const start = parseInt(hour.split(':')[0], 10);
                        const end = String(start + 1).padStart(2, '0') + ':00';
                        toggleSlot(day, hour, end);
                      }}
                    >
                      {hasEvent && (
                        <div
                          className="text-[10px] text-gray-800 dark:text-gray-100 truncate px-1 whitespace-nowrap overflow-hidden"
                          title={matchingEvent.type === 'group' ? `Group ID: ${matchingEvent.group}` : ''}
                        >
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
          groups={myGroups}
        />
      )}
      {isModalExtOpen && (
        <EventModalExtended
          onClose={() => setModalExtOpen(false)}
          onConfirm={handleExtConfirm}
          groups={myGroups}
        />
      )}
    </div>
  );
};
