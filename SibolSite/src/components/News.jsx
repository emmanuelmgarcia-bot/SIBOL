import React from 'react';
import { useData } from '../context/DataContext';

const News = () => {
  const { newsItems } = useData();

  return (
    <div id="news" className="container mx-auto px-4 py-12 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-8 border-b-4 border-green-600 inline-block pb-2 text-green-800">
        News
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsItems.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="h-64 overflow-hidden rounded-md mb-4">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            {item.category && <p className="text-red-600 text-sm font-semibold mb-2">{item.category}</p>}
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex-grow font-serif">{item.title}</h3>
            <div>
                <button className="border border-gray-400 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 transition">
                Read More
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
