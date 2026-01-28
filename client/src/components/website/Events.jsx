import React from 'react';
import { useWebsiteData } from '../../context/WebsiteContext';

const Events = () => {
  const { eventItems } = useWebsiteData();

  return (
    <div id="events" className="container mx-auto px-4 py-12 bg-gray-50 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-8 border-b-4 border-green-600 inline-block pb-2 text-green-800">
        Events
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {eventItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-6">
                {item.category && <p className="text-green-600 text-sm font-semibold mb-2">{item.category}</p>}
                <h3 className="text-xl font-bold text-gray-800 mb-4">{item.title}</h3>
                <button className="text-green-700 font-semibold hover:text-green-900 transition">
                View Details →
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
