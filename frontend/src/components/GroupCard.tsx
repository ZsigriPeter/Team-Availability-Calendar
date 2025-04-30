// components/GroupCard.tsx
interface GroupCardProps {
  id: number;
  name: string;
  onAction?: (id: number) => void;
  actionLabel?: string;
}
  
export default function GroupCard({ id, name, onAction, actionLabel }: GroupCardProps) {
  return (
      <div className="p-4 border rounded-xl shadow-md flex justify-between items-center dark:bg-gray-800">
        <span>{name}</span>
        {onAction && (
        <button
          onClick={() => onAction(id)}
          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
        >
          {actionLabel}
        </button>
      )}
      </div>
    );
  }
  