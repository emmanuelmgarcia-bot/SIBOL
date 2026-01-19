import React from 'react';

const StatCard = ({ label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-chedBlue hover:shadow-md transition-shadow">
    <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wide">{label}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);

export default StatCard;