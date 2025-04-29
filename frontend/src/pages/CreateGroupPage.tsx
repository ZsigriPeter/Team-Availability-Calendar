// pages/CreateGroupPage.tsx
import GroupForm from "@/components/GroupForm";
import { createGroup } from "@/api/groups";
import { useNavigate } from "react-router-dom";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  const handleCreate = async (name: string) => {
    await createGroup(name,navigate);
    alert("Group created!");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Create a Group</h1>
      <GroupForm onSubmit={handleCreate} />
    </div>
  );
}
