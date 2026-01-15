import React from 'react';
import StatCard from '../../components/StatCard';

const HEIDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h1 className="text-2xl font-bold text-chedBlue">Isabela State University</h1>
        <p className="text-gray-500">Cabagan Campus</p>
      </div>

      <h2 className="text-lg font-bold text-gray-700 mb-4">Reports Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Number of Subjects" value="142" />
        <StatCard label="My Programs" value="28" />
        <StatCard label="Total Faculty" value="315" />
        <StatCard label="Faculty Handling Subjects" value="289" />
        <StatCard label="Subjects in Program" value="85" />
        <StatCard label="IP Education Programs" value="4" />
      </div>
    </div>
  );
};

export default HEIDashboard;