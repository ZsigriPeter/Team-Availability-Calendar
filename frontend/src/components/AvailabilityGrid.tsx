import React, { useEffect, useState } from 'react';
import { UserEvent, TimeSlot } from '@/interfaces';
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getMyGroups } from '@/api/groups';
import { EventModalExtended } from './EventModalExtended';
import { ViewEventModal } from './ViewEventModal';
import { FilterModal } from './FilterModal';

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

interface AvailabilityGridProps {
  onEventDeleteGoogleCalendar: (google_event_id: string) => void;
  onEventDelete: (id: number) => void;
  onExtEventCreate: (event: UserEvent) => Promise<UserEvent>;
  eventData: UserEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAddToGoogleCalendar: (event: UserEvent) => void;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  onEventDeleteGoogleCalendar,
  onEventDelete,
  onExtEventCreate,
  eventData,
  currentDate,
  onDateChange,
  onAddToGoogleCalendar,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isModalExtOpen, setModalExtOpen] = useState(false);
  const [myGroups, setMyGroups] = useState<{ id: string; name: string }[]>([]);
  const [editingEvent, setEditingEvent] = useState<UserEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<UserEvent | null>(null);

  const navigate = useNavigate();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<{
    solo: boolean;
    group: Record<number, boolean>;
  }>({ solo: true, group: {} });

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getMyGroups(navigate);
      setMyGroups(groups);

      // Initialize group filter visibility
      const groupFilterDefaults = Object.fromEntries(groups.map(g => [parseInt(g.id), true]));
      setFilters(prev => ({ ...prev, group: groupFilterDefaults }));
    };
    fetchGroups();
  }, [navigate]);

  const toggleSlot = (day: Date, hour_start: string, hour_end: string) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const exists = selectedSlots.find(slot => slot.date === dateStr && slot.hour_start === hour_start && slot.hour_end === hour_end);
    if (exists) {
      setSelectedSlots(prev => prev.filter(slot => !(slot.date === dateStr && slot.hour_start === hour_start && slot.hour_end === hour_end)));
    } else {
      setSelectedSlots(prev => [...prev, { date: dateStr, hour_start, hour_end }]);
    }
  };

  const handleExtConfirm = async (
    type: 'solo' | 'group',
    description: string,
    eventDate: string,
    eventTimeStart: string,
    eventTimeEnd: string,
    eventLocation?: string,
    addToGoogleCalendar?: boolean,
    group?: string
  ) => {
    const updatedEvent: UserEvent = {
      id: editingEvent?.id ?? 0,
      type,
      description,
      date: eventDate,
      start_time: eventTimeStart,
      end_time: eventTimeEnd,
      location: eventLocation,
      user: null,
      group: group ? parseInt(group) : null,
      created_at: '',
      updated_at: '',
    };

    const savedEvent = await onExtEventCreate(updatedEvent);

    if (addToGoogleCalendar && savedEvent) {
      await onAddToGoogleCalendar(savedEvent);
    }

    setEditingEvent(null);
    setModalExtOpen(false);
  };

  const HOUR_HEIGHT_PX = 32;

  const groupColors: Record<number, string> = {
    1: 'bg-purple-300 dark:bg-purple-600 hover:bg-purple-400 dark:hover:bg-purple-500',
    2: 'bg-yellow-300 dark:bg-yellow-600 hover:bg-yellow-400 dark:hover:bg-yellow-500',
    3: 'bg-pink-300 dark:bg-pink-600 hover:bg-pink-400 dark:hover:bg-pink-500',
    4: 'bg-red-300 dark:bg-red-600 hover:bg-red-400 dark:hover:bg-red-500',
  };

  const filteredEvents = eventData.filter(event => {
    if (event.type === 'solo') return filters.solo;
    if (event.type === 'group' && event.group !== null) {
      return filters.group[event.group] ?? false;
    }
    return false;
  });



  return (
    <div className="w-screen h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white p-2 overflow-hidden">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onDateChange(subWeeks(currentDate, 1))}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            Previous Week
          </button>
          <button
            onClick={() => onDateChange(addWeeks(currentDate, 1))}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            Next Week
          </button>
          <button
            onClick={() => setModalExtOpen(true)}
            className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-700 hover:bg-blue-300 dark:hover:bg-blue-600 text-sm"
          >
            Add Event
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            Filter
          </button>

        </div>

        <input
          type="date"
          value={format(currentDate, 'yyyy-MM-dd')}
          onChange={(e) => {
            const picked = new Date(e.target.value);
            onDateChange(startOfWeek(picked, { weekStartsOn: 1 }));
          }}
          className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600 text-sm"
        />
      </div>

      <div className="flex-grow overflow-x-auto overflow-y-hidden">
        <div
          className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] border border-gray-300 dark:border-gray-700 relative box-border min-w-[640px] sm:min-w-full"
          style={{ height: '48rem' }}
        >
          <div></div>
          {daysOfWeek.map(day => (
            <div
              key={day.toISOString()}
              className="text-center p-1 border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-medium"
            >
              {format(day, 'EEE')}<br />{format(day, 'MM/dd')}
            </div>
          ))}

          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="text-[9px] sm:text-[10px] text-right pr-1 pt-1 border text-gray-600 dark:text-gray-300">
                {hour}
              </div>
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
                    className={`h-8 border hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer ${selected ? 'bg-blue-400 dark:bg-blue-600' : ''
                      }`}
                  />
                );
              })}
            </React.Fragment>
          ))}

          {filteredEvents.map(event => {
            const eventDate = parseISO(event.date);
            const dayIndex = daysOfWeek.findIndex(day => isSameDay(eventDate, day));
            if (dayIndex === -1) return null;

            const startHour = parseInt(event.start_time.split(':')[0], 10);
            const startMinute = parseInt(event.start_time.split(':')[1], 10) || 0;
            const endHour = parseInt(event.end_time.split(':')[0], 10);
            const endMinute = parseInt(event.end_time.split(':')[1], 10) || 0;

            const startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;
            const headerOffset = 50;
            const top = (startMinutes / 60) * HOUR_HEIGHT_PX + headerOffset;
            const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX;

            const bgClass = event.type === 'solo'
              ? 'bg-green-300 dark:bg-green-600 hover:bg-green-400 dark:hover:bg-green-500'
              : event.group !== null && groupColors[event.group]
                ? groupColors[event.group]
                : 'bg-orange-300 dark:bg-orange-600 hover:bg-orange-400 dark:hover:bg-orange-500';

            const isShortEvent = (endMinutes - startMinutes) < 60;

            return (
              <div
                key={event.id}
                className={`
                  absolute text-xs px-1 py-0.5
                  ${bgClass}
                  ${isShortEvent ? 'truncate' : 'whitespace-normal overflow-hidden'}
                  text-black dark:text-white
                  rounded-md border border-black/10 dark:border-white/10
                  hover:brightness-105 transition
                `}
                style={{
                  left: `calc(48px + ${dayIndex} * ((100% - 48px) / 7))`,
                  top: `${top}px`,
                  height: `${height}px`,
                  width: `calc((100% - 48px) / 7)`,
                  zIndex: 10,
                  lineHeight: '1.2',
                }}
                onClick={() => setViewingEvent(event)}
                title={event.description}
              >
                {event.description}
                <br />
                {event.location && <span className="text-[0.65rem] opacity-80">{event.location}</span>}
                <br />
                <span className="text-[0.7rem] font-light">
                  ({event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isModalExtOpen && (
        <EventModalExtended
          onClose={() => {
            setModalExtOpen(false);
            setEditingEvent(null);
          }}
          onConfirm={handleExtConfirm}
          groups={myGroups}
          initialData={editingEvent}
        />
      )}

      {viewingEvent && (
        <ViewEventModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onEdit={() => {
            setEditingEvent(viewingEvent);
            setViewingEvent(null);
            setModalExtOpen(true);
          }}
          onDelete={() => {
            onEventDeleteGoogleCalendar(viewingEvent.google_event_id || '');
            onEventDelete(viewingEvent.id);
            setViewingEvent(null);
          }}
        />
      )}
      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFilterChange={setFilters}
        groups={myGroups}
      />
    </div>
  );
};
