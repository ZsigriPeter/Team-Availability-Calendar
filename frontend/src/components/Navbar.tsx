import { Link } from 'react-router-dom'
import { useUser } from '../contexts/UserContext';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const { isLoggedIn, userName, logout } = useUser();

  return (
    <nav className="w-full bg-white dark:bg-gray-900 text-black dark:text-white shadow-md px-4 py-2 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="btn-link">Home</Link>
        {isLoggedIn ? (
          <>
            <Link to="/profile" className="btn-link">{userName}</Link>
            <Link to="/events" className="btn-link">Availability</Link>
            <Link to="/group" className="btn-link">Groups</Link>
            <button
              onClick={logout}
              className="btn-link">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register" className="btn-link">Register</Link>
            <Link to="/login" className="btn-link">Login</Link>
          </>
        )}
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
