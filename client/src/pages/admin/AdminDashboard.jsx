import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Building2, MapPin } from 'lucide-react';
import StatCard from '../../components/StatCard';

const AdminDashboard = () => {
  // --- STATE ---
  const [heiList, setHeiList] = useState([]); // Stores { hei, campuses: [] }
  const [heiSearch, setHeiSearch] = useState('');
  const [selectedHei, setSelectedHei] = useState(null); 
  const [selectedCampus, setSelectedCampus] = useState('');
  const [showHeiList, setShowHeiList] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const wrapperRef = useRef(null);

  // --- 1. FETCH DATA FROM BACKEND (Same as Register.jsx) ---
  useEffect(() => {
    fetch('http://localhost:5000/api/hei-data')
      .then(res => res.json())
      .then(data => {
        if (data.mapping) {
            // Transform the API's 'mapping' object into an array for the Dashboard
            // From: { "ISU": ["Campus A", "Campus B"] }
            // To:   [ { hei: "ISU", campuses: ["Campus A", "Campus B"] } ]
            const parsedList = Object.entries(data.mapping).map(([hei, campuses]) => ({
                hei: hei,
                campuses: campuses.sort()
            }));
            
            // Sort alphabetically
            parsedList.sort((a, b) => a.hei.localeCompare(b.hei));
            
            setHeiList(parsedList);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading HEI data:", err);
        setLoading(false);
      });
  }, []);

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowHeiList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // --- HANDLERS ---
  const handleHeiSelect = (item) => {
    setSelectedHei(item);
    setHeiSearch(item.hei);
    setSelectedCampus(''); // Reset campus
    setShowHeiList(false);
  };

  const filteredHeis = heiList.filter(item => 
    item.hei.toLowerCase().includes(heiSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building2 className="text-blue-600" /> 
            Institution Overview
        </h2>
        
        {loading ? (
             <div className="text-center py-4 text-gray-500">Loading Institution Data...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. SEARCHABLE HEI DROPDOWN */}
                <div className="relative" ref={wrapperRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select HEI</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                            placeholder="Search Institution..."
                            value={heiSearch}
                            onChange={(e) => {
                                setHeiSearch(e.target.value);
                                setShowHeiList(true);
                                if(e.target.value === '') setSelectedHei(null);
                            }}
                            onFocus={() => setShowHeiList(true)}
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>

                    {/* Dropdown List */}
                    {showHeiList && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {filteredHeis.length > 0 ? (
                                filteredHeis.map((item, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium text-gray-700 border-b border-gray-50 last:border-none"
                                        onClick={() => handleHeiSelect(item)}
                                    >
                                        {item.hei}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-400 italic">No institutions found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. CAMPUS DROPDOWN (Dependent) */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Campus</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none text-sm
                                ${!selectedHei ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300'}`}
                            value={selectedCampus}
                            onChange={(e) => setSelectedCampus(e.target.value)}
                            disabled={!selectedHei}
                        >
                            <option value="">{selectedHei ? "Choose Campus..." : "Select HEI first"}</option>
                            {selectedHei && selectedHei.campuses.map((campus) => (
                                <option key={campus} value={campus}>{campus}</option>
                            ))}
                        </select>
                        <MapPin className={`absolute left-3 top-3.5 ${!selectedHei ? 'text-gray-300' : 'text-gray-400'}`} size={18} />
                        <ChevronDown className={`absolute right-3 top-3.5 ${!selectedHei ? 'text-gray-300' : 'text-gray-400'}`} size={18} />
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* DASHBOARD STATS */}
      {selectedHei && selectedCampus && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-2xl font-bold text-gray-800">
                <span className="text-blue-600">{selectedHei.hei}</span> 
                <span className="text-gray-400 mx-2">|</span> 
                <span className="text-gray-600 text-lg">{selectedCampus} Campus</span>
             </h3>
             <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                Active Status
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Number of Subjects" value="142" color="blue" />
            <StatCard label="Degree Programs" value="28" color="indigo" />
            <StatCard label="Total Faculty" value="315" color="green" />
            <StatCard label="Faculty w/ Subjects" value="289" color="emerald" />
            <StatCard label="Subjects in Program" value="85" color="orange" />
            <StatCard label="IP Education Programs" value="4" color="purple" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!selectedHei || !selectedCampus) && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-500">Select an Institution and Campus to view data</h3>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;