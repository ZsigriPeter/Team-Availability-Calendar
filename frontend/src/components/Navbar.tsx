import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import { getUserData } from '@/api/userData';
import { useEffect, useState } from 'react';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  // Check if the user is logged in (you can adjust this based on your actual authentication method)
  const isLoggedIn = localStorage.getItem('accessToken'); // You might use a different method to check authentication
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  const fetchUserName = async () => {
      const data = await getUserData(navigate);
      setUserName(data.username);
    };

    useEffect(() => {
      if (isLoggedIn) {
        fetchUserName();
      }
    }, [isLoggedIn]);

  return (
    <nav className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-md px-4 py-2 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="btn-link">Home</Link>
        {isLoggedIn ? (
          <>
            <span className="btn-link">{userName}</span>
            <Link to="/events" className="btn-link">Availability</Link>
            <Link to="/group" className="btn-link">Groups</Link>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
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
