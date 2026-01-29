import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import AboutUs from './pages/AboutUs';
import LegalBases from './pages/peace/LegalBases';
import VisionMission from './pages/peace/VisionMission';
import Objectives from './pages/peace/Objectives';
import ProgramsProjects from './pages/peace/ProgramsProjects';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
import IPLegalBases from './pages/ip/LegalBases';
import IPVisionMission from './pages/ip/VisionMission';
import IPObjectives from './pages/ip/Objectives';
import IPProgramsProjects from './pages/ip/ProgramsProjects';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/peace/legal-bases" element={<LegalBases />} />
          <Route path="/peace/vision-mission" element={<VisionMission />} />
          <Route path="/peace/objectives" element={<Objectives />} />
          <Route path="/peace/programs" element={<ProgramsProjects />} />
          <Route path="/ip/legal-bases" element={<IPLegalBases />} />
          <Route path="/ip/vision-mission" element={<IPVisionMission />} />
          <Route path="/ip/objectives" element={<IPObjectives />} />
          <Route path="/ip/programs" element={<IPProgramsProjects />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
