import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const { isLoggedIn, userName, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = "border px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition btn-link";
  const linkClassMobile = "block w-full text-left border px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium";


  return (
    <nav className="w-full bg-white dark:bg-gray-900 text-black dark:text-white shadow-md px-4 py-2">
      <div className="flex justify-between items-center">

        {/* Hamburger Menu - Mobile only */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Main Menu - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className={linkClass}>Home</Link>
          {isLoggedIn ? (
            <>
              <Link to="/profile" className={linkClass}>{userName}</Link>
              <Link to="/events" className={linkClass}>Availability</Link>
              <Link to="/group" className={linkClass}>Groups</Link>
              <button onClick={logout} className={linkClass}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/register" className={linkClass}>Register</Link>
              <Link to="/login" className={linkClass}>Login</Link>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className={linkClass}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col items-start space-y-2">
          <Link to="/" className={linkClassMobile}>Home</Link>
          {isLoggedIn ? (
            <>
              <Link to="/profile" className={linkClassMobile}>{userName}</Link>
              <Link to="/events" className={linkClassMobile}>Availability</Link>
              <Link to="/group" className={linkClassMobile}>Groups</Link>
              <button onClick={logout} className={linkClassMobile}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/register" className={linkClassMobile}>Register</Link>
              <Link to="/login" className={linkClassMobile}>Login</Link>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className={linkClassMobile}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      )}
    </nav>
  );
};
