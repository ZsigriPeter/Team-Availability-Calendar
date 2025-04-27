// pages/SearchGroupsPage.tsx
import { useState } from "react";
import { searchGroups, joinGroup } from "@/api/groups";
import GroupCard from "@/components/GroupCard";

export default function SearchGroupsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchGroups(query);
    setResults(data);
  };

  const handleJoin = async (id: number) => {
    await joinGroup(id);
    alert("Joined group!");
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl">Search & Join Groups</h1>
      <div className="flex gap-2">
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
        {results.map((group: any) => (
          <GroupCard key={group.id} id={group.id} name={group.name} onJoin={handleJoin} />
        ))}
      </div>
    </div>
  );
}
