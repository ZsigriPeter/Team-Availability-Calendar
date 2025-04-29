// components/Navbar.tsx
import { Link } from 'react-router-dom'

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-md px-4 py-2 flex justify-between items-center">

    <div className="text-lg font-bold">Team Calendar</div>
    <div className="flex items-center space-x-4">
    <Link to="/" className="text-black dark:text-white hover:underline">Home</Link>
    <Link to="/register" className="text-black dark:text-white hover:underline">Register</Link>
    <Link to="/login" className="text-black dark:text-white hover:underline">Login</Link>
    <Link to="/events" className="text-black dark:text-white hover:underline">Availability</Link>
    <Link to="/group/create" className="text-black dark:text-white hover:underline">Create Group</Link>
    <Link to="/group/search" className="text-black dark:text-white hover:underline">Join Group</Link>
    
    <button
  onClick={toggleDarkMode}
  className="px-3 py-1 rounded border dark:border-white border-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
  >
  {darkMode ? 'Light Mode' : 'Dark Mode'}
  </button>

  </div>
</nav>

  );
};


