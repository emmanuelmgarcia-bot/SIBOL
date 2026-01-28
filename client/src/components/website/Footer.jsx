import React from 'react';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import isuLogo from '../../assets/isu.png';
import chedLogo from '../../assets/ched.png';
import sibolLogo from '../../assets/sibol.png';

const Footer = () => {
  return (
    <footer id="footer" className="bg-green-700 text-white py-12 scroll-mt-24">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
        
        {/* Left: ISU Logo */}
        <div className="flex justify-center md:justify-start w-full md:w-1/4">
          <img src={isuLogo} alt="ISU Logo" className="h-32 w-32 object-contain" />
        </div>

        {/* Center: Info */}
        <div className="flex flex-col items-center text-center w-full md:w-2/4 space-y-4">
          {/* SIBOL Logo in Center */}
          <img src={sibolLogo} alt="CHED SIBOL" className="h-16 object-contain mb-2 bg-white/10 rounded p-1" />
          
          <div className="space-y-1">
            <p className="font-semibold text-lg">Commission on Higher Education</p>
            <p>Carig, Tuguegarao City</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
                <span>📞</span>
                <span>+ 63 997 123 4567</span>
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <a href="#" className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition"><Facebook size={20} /></a>
            <a href="#" className="bg-pink-600 p-2 rounded-full hover:bg-pink-700 transition"><Instagram size={20} /></a>
            <a href="#" className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition"><Youtube size={20} /></a>
            <a href="#" className="bg-sky-500 p-2 rounded-full hover:bg-sky-600 transition"><Twitter size={20} /></a>
          </div>

          <p className="text-sm mt-4">© 2026</p>
        </div>

        {/* Right: CHED Logo */}
        <div className="flex justify-center md:justify-end w-full md:w-1/4">
          <img src={chedLogo} alt="CHED Logo" className="h-32 w-32 object-contain" />
        </div>

      </div>
    </footer>
  );
};

export default Footer;
