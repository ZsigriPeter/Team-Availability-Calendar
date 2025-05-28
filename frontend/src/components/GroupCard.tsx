import { useEffect, useState } from "react";

interface GroupCardProps {
  id: number;
  name: string;
  memberCount: number;
  onAction?: (id: number) => void;
  actionLabel?: string;
  onDelete?: (id: number) => void;
  getRole?: (groupId: number) => Promise<string>;
}

export default function GroupCard({
  id,
  name,
  memberCount,
  onAction,
  actionLabel,
  onDelete,
  getRole,
}: GroupCardProps) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (getRole) {
        const result = await getRole(id);
        setRole(result);
      }
    };

    fetchRole();
  }, [getRole, id]);

  const handleManageRoles = () => {
    console.log(`Manage roles for group ${id}`);
    // TODO: Navigate to role management page/modal
  };

  return (
    <div className="p-4 border rounded-xl shadow-md flex justify-between items-center dark:bg-gray-800">
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-300">
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Show role-based buttons */}
      {role === "owner" ? (
        <div className="flex gap-2">
          <button
            onClick={handleManageRoles}
            className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
          >
            Manage Roles
          </button>
          {onDelete && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this group?")) {
                  onDelete(id);
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          )}

        </div>
      ) : (
        onAction && (
          <button
            onClick={() => onAction(id)}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
