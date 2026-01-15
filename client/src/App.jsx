import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import HEILayout from './components/HEILayout';
import AdminLayout from './components/AdminLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// HEI Pages
import HEIDashboard from './pages/hei/HEIDashboard';
import FacultyManager from './pages/hei/FacultyManager';
import Form1 from './pages/hei/Form1';
import Form2 from './pages/hei/Form2';
import SubjectManager from './pages/hei/SubjectManager'; // Handles Subjects & IP Specializations
import ProgramManager from './pages/hei/ProgramManager'; // Handles CHED Degree Programs
import HEISubmissions from './pages/hei/HEISubmissions'; // Handles Submission History

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminRegistrations from './pages/admin/AdminRegistrations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login Page (Handles both HEI and Admin login via internal logic) */}
        <Route path="/login" element={<Login />} />
        <Route path="/login/admin" element={<Login />} />
        
        {/* Registration Page */}
        <Route path="/register" element={<Register />} />


        {/* ================= HEI PORTAL ROUTES ================= */}
        {/* All routes starting with /hei are wrapped in the HEI Sidebar Layout */}
        <Route path="/hei/*" element={
          <HEILayout>
            <Routes>
              {/* Dashboard */}
              <Route path="dashboard" element={<HEIDashboard />} />
              
              {/* Management Tabs */}
              <Route path="faculty" element={<FacultyManager />} />
              <Route path="subjects" element={<SubjectManager />} />
              <Route path="programs" element={<ProgramManager />} /> 
              
              {/* Submission Forms */}
              <Route path="form1" element={<Form1 />} />
              <Route path="form2" element={<Form2 />} />
              
              {/* History & Status */}
              <Route path="submissions" element={<HEISubmissions />} />
            </Routes>
          </HEILayout>
        } />


        {/* ================= ADMIN PORTAL ROUTES ================= */}
        {/* All routes starting with /admin are wrapped in the Admin Sidebar Layout */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="subjects" element={<AdminSubjects />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="registrations" element={<AdminRegistrations />} />
            </Routes>
          </AdminLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;