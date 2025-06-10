import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchMembers, updateRoleOfUserInGroup, removeUserFromGroup } from "@/api/groups";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

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
            const { ok, data } = await updateRoleOfUserInGroup(parseInt(groupId || "0"), memberId, navigate, newRole);

            if (!ok) throw new Error("Failed to update role");

            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
            );
            toast.success(data.detail || "Role updated.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update role.");
        }
    };

    const removeUser = async (memberId: number) => {
        try {
            await removeUserFromGroup(parseInt(groupId || "0"), memberId, navigate);
            toast.success("User removed from group.");
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } catch (error) {
            console.error("Failed to remove user:", error);
            toast.error("Failed to remove user.");
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
                        {member.role !== "owner" && (
                            <button
                                onClick={() => {
                                    if (confirm(`Remove ${member.username} from the group?`)) {
                                        removeUser(member.id);
                                    }
                                }}
                                className="p-1 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-800"
                                aria-label={`Remove ${member.username}`}
                                title={`Remove ${member.username}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

            </div>
        </div>
    );
}
