import { useState, useEffect } from "react";
import { searchGroups, joinGroup, createGroup, getMyGroups, leaveGroup, getRoleOfUserInGroup, deleteGroup } from "@/api/groups";
import GroupCard from "@/components/GroupCard";
import GroupForm from "@/components/GroupForm";
import { useNavigate } from "react-router-dom";
import { Group } from "@/interfaces";
import toast from "react-hot-toast";
import { getUserData } from "@/api/userData";

export default function GroupsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);

  const [userId, setUserId] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchMyGroups();
    const fetchUserData = async () => {
      try {
        const userData = await getUserData(navigate);
        setUserId(userData.id);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [navigate]);

  const fetchMyGroups = async (): Promise<void> => {
    const data: Group[] = await getMyGroups(navigate);
    setMyGroups(data);
  };

  const handleSearch = async () => {
    const data = await searchGroups(query, navigate);
    setSearchResults(data);
  };

  const handleJoin = async (id: number) => {
    await joinGroup(id, navigate);
    toast.success("Joined group!");
    fetchMyGroups();
  };

  const handleLeave = async (id: number) => {
    await leaveGroup(id, navigate);
    toast.success("Left group!");
    fetchMyGroups();
  };

  const handleCreate = async (name: string) => {
    await createGroup(name, navigate);
    toast.success("Group created!");
    fetchMyGroups();
  };

  const handleDelete = async (groupId: number) => {
    await deleteGroup(groupId, navigate);
    toast.success("Group Deleted!");
    fetchMyGroups();
  };

  const handleGetRoleOfUserInGroup = async (groupId: number) => {
    if (userId === undefined) {
      return null;
    }
    const data = await getRoleOfUserInGroup(groupId, userId, navigate);
    return data.role;
  };


  return (
    <div className="flex justify-center bg-gray-100 dark:bg-gray-700 min-h-screen py-8">
      <div className="p-8 space-y-8 w-full max-w-2xl">
        <section>
          <h2 className="text-2xl mb-2">Your Groups</h2>
          <div className="space-y-2">
            {myGroups.map((group) => (
              <GroupCard key={group.id} id={group.id} name={group.name} actionLabel="Leave" onAction={handleLeave} memberCount={group.member_count} getRole={handleGetRoleOfUserInGroup} onDelete={handleDelete} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl mb-2">Search & Join Groups</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="border px-4 py-2 rounded-xl flex-1 dark:bg-gray-800"
              placeholder="Search for a group"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-xl">
              Search
            </button>
          </div>
          <div className="space-y-2">
            {searchResults.map((group) => (
              <GroupCard key={group.id} id={group.id} name={group.name} onAction={handleJoin} actionLabel="Join" memberCount={group.member_count} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl mb-2">Create Group</h2>
          <GroupForm onSubmit={handleCreate} />
        </section>
      </div>
    </div>
  );
}
