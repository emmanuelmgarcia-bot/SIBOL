import React from 'react';
import { useData } from '../../context/DataContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const VisionMission = () => {
  const { peaceEducation, loading } = useData();
  const pageData = peaceEducation['vision_mission'] || {};
  const { title, content, image } = pageData;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 pt-20">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6">{title || 'Vision and Mission'}</h1>
        
        {image && (
          <div className="mb-8">
            <img src={image} alt={title} className="w-full h-64 object-cover rounded-lg shadow" />
          </div>
        )}

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
             {content ? (
                <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
                  {content}
                </div>
             ) : (
                <p className="text-gray-600">Content coming soon...</p>
             )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VisionMission;