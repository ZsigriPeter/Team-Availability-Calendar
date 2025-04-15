import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeeklyViewPage from './pages/WeeklyViewPage';
import AvailabilityPage from './pages/AvailabilityPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WeeklyViewPage />} />
        <Route path="/events" element={<AvailabilityPage />} />

        {/* More routes can go here */}
      </Routes>
    </Router>
  );
};

export default App;
