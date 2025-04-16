import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeeklyViewPage from './pages/WeeklyViewPage';
import AvailabilityPage from './pages/AvailabilityPage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WeeklyViewPage />} />
        <Route path="/events" element={<AvailabilityPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* More routes can go here */}
      </Routes>
    </Router>
  );
};

export default App;
