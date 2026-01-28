import React from 'react';

const Stats = () => {
  const stats = [
    { value: "65", label: "Partner HEIs" },
    { value: "130", label: "IP Focal Persons" },
    { value: "130", label: "Peace Focal Persons" },
    { value: "100", label: "IP Students in the R2" },
  ];

  return (
    <div className="bg-[#004d00] py-16 text-white relative">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 border-b-4 border-green-600 inline-block pb-2 text-white">
                Sibol Stat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                    <span className="text-6xl font-normal mb-2">{stat.value}</span>
                    <span className="text-xl text-yellow-400">{stat.label}</span>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Stats;
