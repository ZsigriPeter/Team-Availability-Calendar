// components/FilterModal.tsx
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FilterModalProps {
    show: boolean;
    onClose: () => void;
    filters: {
        solo: boolean;
        group: Record<number, boolean>;
    };
    onFilterChange: (newFilters: {
        solo: boolean;
        group: Record<number, boolean>;
    }) => void;
    groups: { id: string; name: string }[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
    show,
    onClose,
    filters,
    onFilterChange,
    groups,
}) => {
    if (!show) return null;

    const toggleSolo = () => {
        onFilterChange({ ...filters, solo: !filters.solo });
    };

    const toggleGroup = (id: number) => {
        onFilterChange({
            ...filters,
            group: {
                ...filters.group,
                [id]: !filters.group[id],
            },
        });
    };

    const onApply = () => {
        onClose();
    };

    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        Filter Options
                    </DialogTitle>

                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <label className="block mb-2 text-gray-800 dark:text-gray-200">
                        <input
                            type="checkbox"
                            checked={filters.solo}
                            onChange={toggleSolo}
                            className="form-checkbox h-4 w-4 text-indigo-600 mr-2"
                        />
                        Solo Events
                    </label>

                    <div className="mb-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200">Group Events</p>
                        {groups.map(group => (
                            <label key={group.id} className="block text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={filters.group[parseInt(group.id)] ?? true}
                                    onChange={() => toggleGroup(parseInt(group.id))}
                                    className="form-checkbox h-4 w-4 text-indigo-600 mr-2"
                                />
                                {group.name}
                            </label>
                        ))}
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={onApply}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
