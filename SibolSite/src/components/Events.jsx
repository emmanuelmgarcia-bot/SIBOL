import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link, useLocation } from 'react-router-dom';

const Events = ({ isHome = false }) => {
  const { eventItems, loading } = useData();
  const location = useLocation();

  useEffect(() => {
    if (!isHome && !loading && location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    } else if (!isHome && !loading && !location.hash) {
       window.scrollTo(0, 0);
    }
  }, [isHome, loading, location.hash]);

  return (
    <div id="events" className="container mx-auto px-4 py-12 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-8 border-b-4 border-green-600 inline-block pb-2 text-green-800">
        Events
      </h2>
      
      {loading ? (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
         </div>
      ) : (
        <div className={isHome ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col space-y-16"}>
            {eventItems.length === 0 && <div className="col-span-full text-center text-gray-500">No events available.</div>}
            {eventItems.map((item) => (
            <div key={item.id} id={!isHome ? `events-${item.id}` : undefined} className={`flex flex-col ${!isHome ? 'bg-white rounded-lg shadow-sm p-6' : ''}`}>
                <div className={`${isHome ? 'h-64' : 'h-96 md:h-[500px]'} overflow-hidden rounded-md mb-4`}>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                {item.category && <p className="text-red-600 text-sm font-semibold mb-2">{item.category}</p>}
                <h3 className={`${isHome ? 'text-xl' : 'text-3xl'} font-bold text-gray-800 mb-4 flex-grow font-serif`}>{item.title}</h3>
                
                {!isHome && item.content && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                    {item.content}
                  </div>
                )}

                {isHome && (
                  <div>
                      <Link 
                        to={`/events#events-${item.id}`}
                        className="border border-gray-400 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 transition inline-block"
                      >
                      Read More
                      </Link>
                  </div>
                )}
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Events;
