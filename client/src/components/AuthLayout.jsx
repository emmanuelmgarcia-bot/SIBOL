import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-200 font-sans">
      {/* Left Side - Branding */}
      {/* Changed pl-12 to pl-32 to push content towards the center */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center pl-32 pr-8">
        {/* Changed mb-8 to mb-3 to bring tagline much closer */}
        <div className="max-w-xl mb-3">
          <img 
            src="/assets/sibol.png" 
            alt="CHED SIBOL Logo" 
            className="w-full h-auto object-contain drop-shadow-2xl" 
          />
        </div>
        {/* Changed color to text-gray-700 for better contrast and weight to font-bold */}
        <h1 className="text-2xl font-bold text-gray-700 tracking-widest uppercase text-center">
          Empowering IP Education
        </h1>
      </div>

      {/* Right Side - Form Content */}
      {/* Adjusted padding to balance the left side shift */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 lg:pl-8 lg:pr-32">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-8 border border-gray-100">
            {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;