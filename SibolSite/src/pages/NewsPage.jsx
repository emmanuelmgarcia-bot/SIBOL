import React from 'react';
import Navbar from '../components/Navbar';
import News from '../components/News';
import Footer from '../components/Footer';

const NewsPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 pt-20">
      <Navbar />
      <main className="flex-grow">
        <News />
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;
