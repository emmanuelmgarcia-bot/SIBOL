import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWebsiteData } from '../../context/WebsiteContext';

const Hero = () => {
  const { heroSlides } = useWebsiteData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, heroSlides]);

  if (!heroSlides || heroSlides.length === 0) {
      return <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">No images available</div>;
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? heroSlides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === heroSlides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="w-full h-[500px] relative group bg-black">
      <img
        src={heroSlides[currentIndex]?.url}
        alt={`Slide ${currentIndex + 1}`}
        className="w-full h-full object-contain transition-opacity duration-500"
      />
      {/* Left Arrow */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition">
        <ChevronLeft onClick={prevSlide} size={30} />
      </div>
      {/* Right Arrow */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition">
        <ChevronRight onClick={nextSlide} size={30} />
      </div>
    </div>
  );
};

export default Hero;
