import React from 'react';
import { useData } from '../context/DataContext';

const News = () => {
  const { newsItems, loading } = useData();

  return (
    <div id="news" className="container mx-auto px-4 py-12 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-8 border-b-4 border-green-600 inline-block pb-2 text-green-800">
        News
      </h2>
      
      {loading ? (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.length === 0 && <div className="col-span-full text-center text-gray-500">No news available.</div>}
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
      )}
    </div>
  );
};

export default News;
