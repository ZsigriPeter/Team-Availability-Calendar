// App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeeklyViewPage from './pages/WeeklyViewPage';
import AvailabilityPage from './pages/AvailabilityPage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import GroupsPage from '@/pages/GroupsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { Navbar } from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './contexts/UserContext';
import ManageRolesPage from './pages/ManageRolesPage';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="w-full">
    <Router>
      <UserProvider>
      <Toaster position="top-right" />
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(prev => !prev)} />
        <Routes>
          <Route path="/" element={<WeeklyViewPage />} />
          <Route path="/events" element={<AvailabilityPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/group" element={<GroupsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/groups/:groupId/manage-roles" element={<ManageRolesPage />} />
        </Routes>
        </UserProvider>
    </Router></div>
  );
}

export default App;
