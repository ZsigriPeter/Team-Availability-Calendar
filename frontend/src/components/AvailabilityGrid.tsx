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
  onAddToGoogleCalendar:(event: UserEvent) => void;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  onEventCreate,
  onExtEventCreate,
  eventData,
  currentDate,
  onDateChange,
  onAddToGoogleCalendar,
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

  const toggleSlot = (day: Date, hour_start: string, hour_end: string) => {
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
    addToGoogleCalendar?: boolean,
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
    if (addToGoogleCalendar) {
      onAddToGoogleCalendar({
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
    }
    setModalExtOpen(false);
  };

  const HOUR_HEIGHT_PX = 32; // h-8 = 2rem = 32px

  const groupColors: Record<number, string> = {
    1: 'bg-purple-300 dark:bg-purple-600 hover:bg-purple-400 dark:hover:bg-purple-500',
    2: 'bg-yellow-300 dark:bg-yellow-600 hover:bg-yellow-400 dark:hover:bg-yellow-500',
    3: 'bg-pink-300 dark:bg-pink-600 hover:bg-pink-400 dark:hover:bg-pink-500',
    4: 'bg-red-300 dark:bg-red-600 hover:bg-red-400 dark:hover:bg-red-500',
    // fallback group color below
  };

  

  return (

    <div className="w-screen h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white p-2 overflow-hidden">
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

      <div className="flex-grow overflow-x-auto">
        <div
          className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border border-gray-300 dark:border-gray-700 relative box-border"
          style={{ height: '48rem' }}
        >
          {/* Header row */}
          <div></div>
          {daysOfWeek.map(day => (
            <div
              key={day.toISOString()}
              className="text-center p-1 border border-gray-300 dark:border-gray-700 text-sm font-medium"
            >
              {format(day, 'EEEE')}<br />{format(day, 'MM/dd')}
            </div>
          ))}

          {/* Hour labels and time grid */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time Label */}
              <div className="text-[10px] text-right pr-1 pt-1 border text-gray-600 dark:text-gray-300">
                {hour}
              </div>

              {/* Time Slots for Each Day */}
              {daysOfWeek.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const hourEnd = String(parseInt(hour.split(':')[0]) + 1).padStart(2, '0') + ':00';
                const selected = selectedSlots.some(slot =>
                  slot.date === dateStr && slot.hour_start === hour
                );

                return (
                  <div
                    key={day.toISOString() + hour}
                    onClick={() => toggleSlot(day, hour, hourEnd)}
                    className={`h-8 border hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer
            ${selected ? 'bg-blue-400 dark:bg-blue-600' : ''}`}
                  >
                    {/* You can optionally show content */}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
          {eventData.map(event => {
            const eventDate = parseISO(event.date);
            const dayIndex = daysOfWeek.findIndex(day => isSameDay(eventDate, day));
            if (dayIndex === -1) return null;

            const startTimeParts = event.start_time.split(':');
            const endTimeParts = event.end_time.split(':');
            const startHour = parseInt(startTimeParts[0], 10);
            const startMinute = parseInt(startTimeParts[1], 10) || 0;
            const endHour = parseInt(endTimeParts[0], 10);
            const endMinute = parseInt(endTimeParts[1], 10) || 0;

            const startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;
            const headerOffset = 50; // Adjust based on your header height
            const top = (startMinutes / 60) * HOUR_HEIGHT_PX + headerOffset;
            const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX;

            console.log(`Event: ${event.description}`, {
              date: event.date,
              start_time: event.start_time,
              end_time: event.end_time,
              startMinutes,
              endMinutes,
              top,
              height,
              dayIndex,
            });
            
            const bgClass = event.type === 'solo'
              ? 'bg-green-300 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500'
              : event.group !== null && groupColors[event.group]
                ? groupColors[event.group]
                : 'bg-orange-300 dark:bg-orange-600 hover:bg-orange-400 dark:hover:bg-orange-500';
            const isShortEvent = (endMinutes - startMinutes) < 60;
            return (
              
              <div
                key={event.id}
                className={`absolute text-xs px-1 ${bgClass} ${isShortEvent ? 'truncate' : 'whitespace-normal overflow-hidden'}`}
                style={{
                  left: `calc(64px + ${dayIndex} * ((100% - 64px) / 7))`,
                  top: `${top}px`,
                  height: `${height}px`,
                  width: `calc((100% - 64px) / 7)`,
                  zIndex: 10,
                  lineHeight: '1.2',
                }}
                title={event.description}
              >
                {event.description} - ({event.start_time} - {event.end_time})
              </div>
            );
          })}

        </div>
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
