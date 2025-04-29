// App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeeklyViewPage from './pages/WeeklyViewPage';
import AvailabilityPage from './pages/AvailabilityPage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import CreateGroupPage from '@/pages/CreateGroupPage';
import SearchGroupPage from '@/pages/SearchGroupsPage';
import { Navbar } from './components/Navbar';

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
    <Router>
      <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(prev => !prev)} />

      <Routes>
        <Route path="/" element={<WeeklyViewPage />} />
        <Route path="/events" element={<AvailabilityPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/group/create" element={<CreateGroupPage />} />
        <Route path="/group/search" element={<SearchGroupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
