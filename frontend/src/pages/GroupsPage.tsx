import { useState, useEffect } from "react";
import { searchGroups, joinGroup, createGroup, getMyGroups, leaveGroup } from "@/api/groups";
import GroupCard from "@/components/GroupCard";
import GroupForm from "@/components/GroupForm";
import { useNavigate } from "react-router-dom";

export default function GroupsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    const data = await getMyGroups(navigate);
    setMyGroups(data);
  };

  const handleSearch = async () => {
    const data = await searchGroups(query, navigate);
    setSearchResults(data);
  };

  const handleJoin = async (id: number) => {
    await joinGroup(id, navigate);
    alert("Joined group!");
    fetchMyGroups();
  };

    const handleLeave = async (id: number) => {
        await leaveGroup(id, navigate);
        alert("Left group!");
        fetchMyGroups();
    };

  const handleCreate = async (name: string) => {
    await createGroup(name, navigate);
    alert("Group created!");
    fetchMyGroups();
  };

  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-2xl mb-2">Your Groups</h2>
        <div className="space-y-2">
          {myGroups.map((group: any) => (
            <GroupCard key={group.id} id={group.id} name={group.name} actionLabel="Leave" onAction={handleLeave}/>
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
          {searchResults.map((group: any) => (
            <GroupCard key={group.id} id={group.id} name={group.name} onAction={handleJoin} actionLabel="Join" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl mb-2">Create Group</h2>
        <GroupForm onSubmit={handleCreate} />
      </section>

    </div>
  );
}
