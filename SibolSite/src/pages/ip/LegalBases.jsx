import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const LegalBases = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 pt-20">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Legal Bases of IP Education</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">Content coming soon...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalBases;