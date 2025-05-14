import React, { useEffect, useState } from 'react';
import { getMyGroups, leaveGroup } from '@/api/groups';
import { getUserData } from '@/api/userData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import GroupCard from "@/components/GroupCard";
import { UserInfoCard } from '@/components/UserInfoCard';
import { Group } from '@/interfaces';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ id: number; username: string; email: string } | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = await getUserData(navigate);
            const myGroups = await getMyGroups(navigate);
            setUser(userInfo);
            setGroups(myGroups);
        };

        fetchData();
    }, [navigate]);

    const fetchMyGroups = async (): Promise<void> => {
        const data: Group[] = await getMyGroups(navigate);
        setGroups(data);
    };

    const handleLeave = async (id: number) => {
        await leaveGroup(id, navigate);
        toast.success("Left group!");
        fetchMyGroups();
    };

    return (
        <div className="flex justify-center bg-gray-100 dark:bg-gray-700 min-h-screen py-8">
            <div className="p-8 space-y-8 w-full max-w-2xl">
                {user && <UserInfoCard user={user} />}
                <section>
                    <h2 className="text-2xl mb-2">Your Groups</h2>
                    <div className="space-y-2">
                        {groups.map((group) => (
                            <GroupCard key={group.id} id={group.id} name={group.name} actionLabel="Leave" onAction={handleLeave} memberCount={group.member_count} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
