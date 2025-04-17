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
      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/events">Availability</Link>
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


