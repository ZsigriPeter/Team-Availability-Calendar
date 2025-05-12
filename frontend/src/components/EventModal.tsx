// EventModal.tsx
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
  onConfirm: (type: 'solo' | 'group', description: string, groupId?: string) => void;
  groups: { id: string; name: string }[]; // New prop: list of user's groups
}

export const EventModal: React.FC<EventModalProps> = ({ onClose, onConfirm, groups }) => {
  const [type, setType] = useState<'solo' | 'group'>('solo');
  const [description, setDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const handleConfirm = () => {
    if (type === 'group' && !selectedGroup) {
      toast.success('Please select a group.');
      return;
    }

    onConfirm(type, description, selectedGroup || undefined);
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

