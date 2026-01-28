import React, { useEffect, useState } from 'react';

const Stats = () => {
  const [statsData, setStatsData] = useState({
    heiCount: 0,
    ipFacultyCount: 0,
    ipSubjectCount: 0
  });

  useEffect(() => {
    // Fetch stats from the backend
    const fetchStats = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/website/stats`);
        if (res.ok) {
          const data = await res.json();
          setStatsData({
            heiCount: data.heiCount || 0,
            ipFacultyCount: data.ipFacultyCount || 0,
            ipSubjectCount: data.ipSubjectCount || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-green-800 py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          {/* Partner HEIs */}
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold mb-2">{statsData.heiCount}</h3>
            <p className="text-lg text-green-100 uppercase tracking-wide">Partner HEIs</p>
          </div>

          {/* Total IP Subjects */}
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold mb-2">{statsData.ipSubjectCount}</h3>
            <p className="text-lg text-green-100 uppercase tracking-wide">Total IP Subjects</p>
          </div>

          {/* IP Education Faculties */}
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold mb-2">{statsData.ipFacultyCount}</h3>
            <p className="text-lg text-green-100 uppercase tracking-wide">IP Education Faculties</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Stats;
