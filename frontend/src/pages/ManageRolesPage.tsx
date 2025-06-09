import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchMembers } from "@/api/groups";

interface Member {
    id: number;
    username: string;
    role: string;
}

export default function ManageRolesPage() {
    const { groupId } = useParams();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroupMembers = async () => {
            try {
                if (!groupId) throw new Error("Group ID is required");

                const data = await fetchMembers(parseInt(groupId), navigate);
                setMembers(data);
            } catch (error) {
                console.error("Failed to fetch members:", error);
                navigate("/groups");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupMembers();
    }, [groupId]);

    const updateRole = async (memberId: number, newRole: string) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/members/${memberId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) throw new Error("Failed to update role");

            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex justify-center bg-gray-100 dark:bg-gray-700 min-h-screen py-8">
            <div className="p-8 space-y-6 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Manage Roles</h1>

                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex justify-between items-center border-b py-2"
                    >
                        <span className="text-gray-800 dark:text-gray-200">
                            {member.username}
                        </span>
                        <select
                            value={member.role}
                            onChange={(e) => updateRole(member.id, e.target.value)}
                            disabled={member.role === "owner"}
                            className="border px-3 py-1 rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            {member.role === "owner" && <option value="owner">Owner</option>}
                        </select>
                    </div>
                ))}

            </div>
        </div>
    );
}
