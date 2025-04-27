// components/GroupForm.tsx
import { useState } from "react";

interface GroupFormProps {
  onSubmit: (name: string) => void;
}

export default function GroupForm({ onSubmit }: GroupFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <input
        type="text"
        placeholder="Group name"
        className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
        Create Group
      </button>
    </form>
  );
}
