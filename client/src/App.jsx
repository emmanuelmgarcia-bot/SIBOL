import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HEILayout from './components/HEILayout';
import AdminLayout from './components/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';

import HEIDashboard from './pages/hei/HEIDashboard';
import FacultyManager from './pages/hei/FacultyManager';
import Form1 from './pages/hei/Form1';
import Form2 from './pages/hei/Form2';
import SubjectManager from './pages/hei/SubjectManager';
import ProgramManager from './pages/hei/ProgramManager';
import HEISubmissions from './pages/hei/HEISubmissions';
import HEIAccount from './pages/hei/HEIAccount';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminAccount from './pages/admin/AdminAccount';

const externalHomepage = import.meta.env.VITE_SIBOL_SITE_URL || 'http://localhost:5173';

const RootRoute = () => {
  const target = externalHomepage.trim();
  if (target) {
    window.location.href = target.replace(/\/$/, '');
    return null;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/admin" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/hei/*"
          element={
            <HEILayout>
              <Routes>
                <Route path="dashboard" element={<HEIDashboard />} />
                <Route path="faculty" element={<FacultyManager />} />
                <Route path="subjects" element={<SubjectManager />} />
                <Route path="programs" element={<ProgramManager />} />
                <Route path="form1" element={<Form1 />} />
                <Route path="form2" element={<Form2 />} />
                <Route path="submissions" element={<HEISubmissions />} />
                <Route path="account" element={<HEIAccount />} />
              </Routes>
            </HEILayout>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="subjects" element={<AdminSubjects />} />
                <Route path="programs" element={<AdminPrograms />} />
                <Route path="submissions" element={<AdminSubmissions />} />
                <Route path="registrations" element={<AdminRegistrations />} />
                <Route path="account" element={<AdminAccount />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
