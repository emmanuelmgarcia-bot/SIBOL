import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import sibolLogo from '../assets/sibol.png';

const Navbar = () => {
  const [isPeaceOpen, setIsPeaceOpen] = useState(false);
  const [isIPOpen, setIsIPOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (id) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const peaceItems = [
    "Legal Bases of Peace Education",
    "Vision and Mission",
    "Objectives",
    "Programs, Projects and Activities"
  ];

  const ipItems = [
    "Legal Bases of IP Education", 
    "Vision and Mission",
    "Objectives",
    "Programs, Projects and Activities"
  ];

  return (
    <nav className="bg-white shadow-md w-full z-50 fixed top-0 left-0 right-0">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex flex-col items-start cursor-pointer" onClick={() => navigate('/')}>
          <img src={sibolLogo} alt="CHED SIBOL Logo" className="h-16 object-contain" />
          <span className="text-[10px] font-bold text-green-900 mt-1 whitespace-nowrap">
            Synergy for Indigenous and Peace-based Opportunities for Learning
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-green-800 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-green-800">
          <button onClick={() => navigate('/admin')} className="hover:text-green-600">Login</button>
          
          {/* Peace Education Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsPeaceOpen(true)}
            onMouseLeave={() => setIsPeaceOpen(false)}
          >
            <button className="flex items-center hover:text-green-600 focus:outline-none">
              Peace Education <ChevronDown size={14} className="ml-1" />
            </button>
            {isPeaceOpen && (
              <div className="absolute left-0 mt-0 w-64 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50">
                {peaceItems.map((item, index) => (
                  <a key={index} href="#" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700">
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* IP Education Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsIPOpen(true)}
            onMouseLeave={() => setIsIPOpen(false)}
          >
            <button className="flex items-center hover:text-green-600 focus:outline-none">
              IP Education <ChevronDown size={14} className="ml-1" />
            </button>
            {isIPOpen && (
              <div className="absolute left-0 mt-0 w-64 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50">
                {ipItems.map((item, index) => (
                  <a key={index} href="#" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700">
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => handleNavigation('footer')} className="hover:text-green-600">Message Us</button>
          <button onClick={() => handleNavigation('events')} className="hover:text-green-600">Events</button>
          <button onClick={() => handleNavigation('news')} className="hover:text-green-600">News</button>
          <a href="#" className="hover:text-green-600">About Us</a>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 flex flex-col space-y-4 shadow-lg max-h-[80vh] overflow-y-auto">
          <button onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} className="text-left text-green-800 font-medium hover:text-green-600">Login</button>
          
          {/* Mobile Peace Education */}
          <div className="space-y-2">
            <button 
              className="flex items-center text-green-800 font-medium w-full justify-between"
              onClick={() => setIsPeaceOpen(!isPeaceOpen)}
            >
              Peace Education <ChevronDown size={14} className={`transform transition-transform ${isPeaceOpen ? 'rotate-180' : ''}`} />
            </button>
            {isPeaceOpen && (
              <div className="pl-4 space-y-2 border-l-2 border-green-100 ml-1">
                {peaceItems.map((item, index) => (
                  <a key={index} href="#" className="block text-sm text-gray-600 hover:text-green-700 py-1">
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile IP Education */}
          <div className="space-y-2">
            <button 
              className="flex items-center text-green-800 font-medium w-full justify-between"
              onClick={() => setIsIPOpen(!isIPOpen)}
            >
              IP Education <ChevronDown size={14} className={`transform transition-transform ${isIPOpen ? 'rotate-180' : ''}`} />
            </button>
            {isIPOpen && (
              <div className="pl-4 space-y-2 border-l-2 border-green-100 ml-1">
                {ipItems.map((item, index) => (
                  <a key={index} href="#" className="block text-sm text-gray-600 hover:text-green-700 py-1">
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => handleNavigation('footer')} className="text-left text-green-800 font-medium hover:text-green-600">Message Us</button>
          <button onClick={() => handleNavigation('events')} className="text-left text-green-800 font-medium hover:text-green-600">Events</button>
          <button onClick={() => handleNavigation('news')} className="text-left text-green-800 font-medium hover:text-green-600">News</button>
          <a href="#" className="text-green-800 font-medium hover:text-green-600">About Us</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
