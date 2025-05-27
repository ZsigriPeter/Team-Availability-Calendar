interface Props {
    user: { id: number; username: string; email: string };
  }
  
  export const UserInfoCard: React.FC<Props> = ({ user }) => {
    return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-2">User Information</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
};