// components/GroupCard.tsx
interface GroupCardProps {
    id: number;
    name: string;
    onJoin: (id: number) => void;
  }
  
  export default function GroupCard({ id, name, onJoin }: GroupCardProps) {
    return (
      <div className="p-4 border rounded-xl shadow-md flex justify-between items-center dark:bg-gray-800">
        <span>{name}</span>
        <button onClick={() => onJoin(id)} className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
          Join
        </button>
      </div>
    );
  }
  