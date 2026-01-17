import React, { useEffect, useState } from 'react';
import StatCard from '../../components/StatCard';

const HEIDashboard = () => {
  const [heiName, setHeiName] = useState('');
  const [campusName, setCampusName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    subjects: 0,
    programs: 0,
    totalFaculty: 0,
    facultyWithSubjects: 0,
    subjectsInProgram: 0,
    ipPrograms: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const userRaw = localStorage.getItem('sibol_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const heiId = user && user.hei_id ? user.hei_id : null;

        if (!heiId) {
          setLoading(false);
          return;
        }

        const apiBase =
          window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : '';

        const [heisRes, subjectsRes, facultyRes, programsRes] = await Promise.all([
          fetch(`${apiBase}/api/heis`),
          fetch(`${apiBase}/api/heis/subjects?heiId=${encodeURIComponent(heiId)}`),
          fetch(`${apiBase}/api/heis/faculty?heiId=${encodeURIComponent(heiId)}`),
          fetch(`${apiBase}/api/heis/programs/requests?heiId=${encodeURIComponent(heiId)}`)
        ]);

        const [heisData, subjectsData, facultyData, programsData] = await Promise.all([
          heisRes.json(),
          subjectsRes.json(),
          facultyRes.json(),
          programsRes.json()
        ]);

        if (Array.isArray(heisData)) {
          const match = heisData.find(h => String(h.id) === String(heiId));
          if (match) {
            setHeiName(match.name || '');
            setCampusName(match.campus_name || '');
          }
        }

        const subjects = Array.isArray(subjectsData) ? subjectsData : [];
        const faculty = Array.isArray(facultyData) ? facultyData : [];
        const programs = Array.isArray(programsData) ? programsData : [];

        const totalSubjects = subjects.length;
        const ipPrograms = subjects.filter(s => s.type === 'Degree Program').length;
        const subjectsInProgram = subjects.filter(s => s.type !== 'Degree Program').length;
        const totalFaculty = faculty.length;

        setStats({
          subjects: totalSubjects,
          programs: programs.length,
          totalFaculty,
          facultyWithSubjects: totalFaculty,
          subjectsInProgram,
          ipPrograms
        });
      } catch (err) {
        console.error('Error loading HEI dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h1 className="text-2xl font-bold text-chedBlue">
          {heiName || 'My Institution'}
        </h1>
        <p className="text-gray-500">
          {campusName || 'Campus'}
        </p>
      </div>

      <h2 className="text-lg font-bold text-gray-700 mb-4">Reports Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Number of Subjects" value={loading ? '...' : stats.subjects} />
        <StatCard label="My Programs" value={loading ? '...' : stats.programs} />
        <StatCard label="Total Faculty" value={loading ? '...' : stats.totalFaculty} />
        <StatCard
          label="Faculty Handling Subjects"
          value={loading ? '...' : stats.facultyWithSubjects}
        />
        <StatCard
          label="Subjects in Program"
          value={loading ? '...' : stats.subjectsInProgram}
        />
        <StatCard
          label="IP Education Programs"
          value={loading ? '...' : stats.ipPrograms}
        />
      </div>
    </div>
  );
};

export default HEIDashboard;
