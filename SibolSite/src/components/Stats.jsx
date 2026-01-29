import React, { useState, useEffect } from 'react';

const Stats = () => {
  const [statsData, setStatsData] = useState({
    heiCount: 0,
    facultyCount: 0,
    ipSubjectCount: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let apiBase = import.meta.env.VITE_API_BASE_URL || '';
        
        // Smart fallback for local development if proxy/env isn't set
        if (!apiBase && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
             apiBase = 'http://localhost:5000';
        }

        console.log('Fetching stats from:', `${apiBase}/api/website/stats`);

        const res = await fetch(`${apiBase}/api/website/stats`);
        
        // Debug: Log non-JSON responses
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            const text = await res.text();
            console.error('Stats fetch returned non-JSON:', text.substring(0, 100));
            throw new Error(`Expected JSON but got ${contentType}`);
        }

        console.log('Stats response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Stats data received:', data);
          setStatsData({
            heiCount: data.heiCount || 0,
            facultyCount: data.facultyCount || 0,
            ipSubjectCount: data.ipSubjectCount || 0
          });
          setError(null);
        } else {
            console.error('Stats response not OK:', res.statusText);
            setError(`Error: ${res.status} ${res.statusText}`);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(`Fetch failed: ${err.message}`);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { value: statsData.heiCount.toLocaleString(), label: "Partner HEIs" },
    { value: statsData.ipSubjectCount.toLocaleString(), label: "IP Subjects" },
    { value: statsData.facultyCount.toLocaleString(), label: "Total Faculties" }
  ];

  return (
    <div className="bg-[#004d00] py-16 text-white relative">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 border-b-4 border-green-600 inline-block pb-2 text-white">
                Sibol Stats
            </h2>
            {error && <p className="text-red-400 mb-4">{error}</p>}
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
