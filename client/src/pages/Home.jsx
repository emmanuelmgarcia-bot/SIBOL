import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/website/Navbar';
import Hero from '../components/website/Hero';
import Stats from '../components/website/Stats';
import News from '../components/website/News';
import Events from '../components/website/Events';
import Footer from '../components/website/Footer';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        // Add a small delay to ensure rendering is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 pt-20">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <News />
        <Events />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
