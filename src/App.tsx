import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TravelProvider } from './context/TravelContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import ItineraryPage from './pages/ItineraryPage';
import AssistantPage from './pages/AssistantPage';

export default function App() {
  return (
    <TravelProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
        </Routes>
      </BrowserRouter>
    </TravelProvider>
  );
}
