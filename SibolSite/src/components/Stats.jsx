import React, { useState, useEffect } from 'react';

const Stats = () => {
  const [statsData, setStatsData] = useState({
    heiCount: 0,
    ipFacultyCount: 0,
    ipSubjectCount: 0
  });

  useEffect(() => {
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

  const stats = [
    { value: statsData.heiCount.toLocaleString(), label: "Partner HEIs" },
    { value: statsData.ipSubjectCount.toLocaleString(), label: "Total IP subjects" },
    { value: statsData.ipFacultyCount.toLocaleString(), label: "IP Education Faculties" }
  ];

  return (
    <div className="bg-[#004d00] py-16 text-white relative">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 border-b-4 border-green-600 inline-block pb-2 text-white">
                Sibol Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                    <span className="text-6xl font-normal mb-2">{stat.value}</span>
                    <span className="text-xl text-yellow-400">{stat.label}</span>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Stats;
