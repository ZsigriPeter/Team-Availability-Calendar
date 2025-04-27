// pages/CreateGroupPage.tsx
import GroupForm from "@/components/GroupForm";
import { createGroup } from "@/api/groups";

export default function CreateGroupPage() {
  const handleCreate = async (name: string) => {
    await createGroup(name);
    alert("Group created!");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Create a Group</h1>
      <GroupForm onSubmit={handleCreate} />
    </div>
  );
}
