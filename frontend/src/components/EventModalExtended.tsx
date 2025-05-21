// EventModalExtended.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import toast from "react-hot-toast";

interface EventModalProps {
  onClose: () => void;
  onConfirm: (type: 'solo' | 'group', description: string,  
    eventDate:string, eventTimeStart:string, eventTimeEnd:string, eventLocation:string, groupId?: string) => void;
  groups: { id: string; name: string }[];
}

export const EventModalExtended: React.FC<EventModalProps> = ({ onClose, onConfirm, groups }) => {
  const [type, setType] = useState<'solo' | 'group'>('solo');
  const [description, setDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTimeStart, setEventTimeStart] = useState<string>('');
  const [eventTimeEnd, setEventTimeEnd] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('');

  const handleConfirm = () => {
    if (type === 'group' && !selectedGroup) {
      toast.success('Please select a group.');
      return;
    }

    onConfirm(type, description, eventDate, eventTimeStart, eventTimeEnd, eventLocation, selectedGroup || undefined);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Create Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'solo' | 'group');
                if (e.target.value === 'solo') setSelectedGroup('');
              }}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
            >
              <option value="solo">Solo</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* Group Selection */}
          {type === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
              >
                <option value="">-- Select a Group --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
              onChange={(e) => {
                setEventDate(e.target.value);
              }}
            />
          </div>

          {/* Event Time Start */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Time Start
            </label>
            <input
              type="time"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
              onChange={(e) => {
                setEventTimeStart(e.target.value);
              }}
            />
          </div>

          {/* Event Time End */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Time End
            </label>
            <input
              type="time"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
              onChange={(e) => {
                setEventTimeEnd(e.target.value);
              }}
            />
          </div>

          {/* Event Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Location
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
              onChange={(e) => {
                setEventLocation(e.target.value);
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm}>Save Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

