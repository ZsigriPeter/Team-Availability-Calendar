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

interface EventModalProps {
  onClose: () => void;
  onConfirm: (type: 'solo' | 'group', description: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ onClose, onConfirm }) => {
  const [type, setType] = useState<'solo' | 'group'>('solo');
  const [description, setDescription] = useState('');

  return (
    <Dialog open onOpenChange={onClose}>
  <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
    <DialogHeader>
      <DialogTitle className="text-gray-900 dark:text-white">Create Event</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Event Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'solo' | 'group')}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
        >
          <option value="solo">Solo</option>
          <option value="group">Group</option>
        </select>
      </div>

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
      <Button onClick={() => onConfirm(type, description)}>Save Event</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

  );
};
