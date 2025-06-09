import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Pencil } from 'lucide-react';
import { UserEvent } from '@/interfaces';
import { useEffect, useState } from 'react';
import { getRoleOfUserInGroup } from '@/api/groups';
import { getUserData } from '@/api/userData';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

type ViewEventModalProps = {
    event: UserEvent | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
};



export const ViewEventModal: React.FC<ViewEventModalProps> = ({ event, onClose, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [myRole, setMyRole] = useState<'admin' | 'member' | 'owner' | null>(null);

    useEffect(() => {
        if (!event) return;

        const groupId = event.group;
        if (groupId !== null && groupId !== undefined) {
            getUserData(navigate)
                .then(userData => {
                    if (!userData) {
                        toast.error('Failed to fetch user data.');
                        onClose();
                        return;
                    }
                    return getRoleOfUserInGroup(groupId, userData.id, navigate);
                })
                .then(role => {
                    if (role) {
                        setMyRole(role.role);
                    } else {
                        toast.error('Failed to fetch group role.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching group role:', error);
                    toast.error('Failed to fetch group role.');
                });
        } else{
            setMyRole('owner');
        }
    }, [event, onClose]);
    if (!event) return null;

    return (
        <Dialog open={!!event} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                    <DialogHeader className="flex items-center">
                        <DialogTitle className="text-gray-900 dark:text-white">Event Details</DialogTitle>
                        <div className="flex ml-auto pr-2 space-x-2">
                            {myRole === "admin" || myRole === "owner" && (
                                <button
                                    onClick={onEdit}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <Pencil className="h-5 w-5" />
                                </button>
                            )}
                            {myRole === "admin" || myRole === "owner" && (
                            <button
                                onClick={onDelete}
                                className="p-2 text-red-600 hover:text-red-700 dark:hover:text-red-500"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>)}
                        </div>


                    </DialogHeader>

                </div>

                <div className="space-y-4 mt-4">
                    {/* Event Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Event Type
                        </label>
                        <p className="text-gray-900 dark:text-white">{event.type === 'group' ? 'Group' : 'Solo'}</p>
                    </div>

                    {/* Group */}
                    {/*event.group && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group
              </label>
              <p className="text-gray-900 dark:text-white">{event.group.name}</p>
            </div>
          )*/}

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date
                        </label>
                        <p className="text-gray-900 dark:text-white">{event.date}</p>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time
                        </label>
                        <p className="text-gray-900 dark:text-white">
                            {event.start_time} - {event.end_time}
                        </p>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Location
                        </label>
                        <p className="text-gray-900 dark:text-white">{event.location}</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <p className="text-gray-900 dark:text-white whitespace-pre-line">
                            {event.description || 'No description'}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
