import React from 'react';
import Navbar from '../components/Navbar';
import Events from '../components/Events';
import Footer from '../components/Footer';

const EventsPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 pt-20">
      <Navbar />
      <main className="flex-grow">
        <Events />
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
