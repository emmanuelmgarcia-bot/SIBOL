import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Building2, MapPin, CheckCircle, XCircle, FileText } from 'lucide-react';

const AdminSubjects = () => {
  // --- HEI & CAMPUS SELECTION STATE ---
  const [heiList, setHeiList] = useState([]);
  const [heiSearch, setHeiSearch] = useState('');
  const [selectedHei, setSelectedHei] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [showHeiList, setShowHeiList] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);

  // --- SUBJECT MANAGEMENT STATE ---
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Approved', 'For Approval'
  
  const [subjects, setSubjects] = useState([]);

  // --- 1. FETCH HEI DATA ---
  useEffect(() => {
    fetch('http://localhost:5000/api/hei-data')
      .then(res => res.json())
      .then(data => {
        if (data.mapping) {
            const parsedList = Object.entries(data.mapping).map(([hei, campuses]) => ({
                hei: hei,
                campuses: campuses.sort()
            }));
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
    setSelectedCampus('');
    setShowHeiList(false);
  };

  const filteredHeis = heiList.filter(item => 
    item.hei.toLowerCase().includes(heiSearch.toLowerCase())
  );

  // Approve Logic: Updates status to 'Approved'
  const handleApprove = (id) => {
    if(window.confirm("Approve this subject?")) {
        setSubjects(subjects.map(s => s.id === id ? { ...s, status: 'Approved' } : s));
    }
  };

  // Decline Logic: DELETES the entry
  const handleDecline = (id) => {
    if(window.confirm("Decline this subject? This will delete the entry.")) {
        setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  // Filter Subjects based on Tab
  const filteredSubjects = subjects.filter(sub => {
    if (activeTab === 'All') return true;
    return sub.status === activeTab;
  });

  // --- RENDER ---
  return (
    <div className="space-y-6">
      
      {/* 1. SELECTION HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building2 className="text-blue-600" /> 
            Subject Approval
        </h2>

        {loading ? (
             <div className="text-center py-4 text-gray-500">Loading Institution Data...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HEI Search */}
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
                    {showHeiList && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {filteredHeis.length > 0 ? (
                                filteredHeis.map((item, index) => (
                                    <button key={index} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={() => handleHeiSelect(item)}>
                                        {item.hei}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-400 italic">No institutions found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Campus Select */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Campus</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none text-sm ${!selectedHei ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`}
                            value={selectedCampus}
                            onChange={(e) => setSelectedCampus(e.target.value)}
                            disabled={!selectedHei}
                        >
                            <option value="">{selectedHei ? "Choose Campus..." : "Select HEI first"}</option>
                            {selectedHei && selectedHei.campuses.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* 2. MAIN CONTENT (Only show if HEI & Campus Selected) */}
      {selectedHei && selectedCampus ? (
        <div className="space-y-6 animate-fade-in">
            
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{selectedHei.hei}</h3>
                    <p className="text-sm text-blue-600 font-medium">{selectedCampus} Campus</p>
                </div>
                
                {/* Filter Tabs */}
                <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                    {['All', 'Approved', 'For Approval'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md transition-all ${
                                activeTab === tab 
                                ? 'bg-white text-gray-800 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th className="p-4">Type</th>
                            <th className="p-4">Code</th>
                            <th className="p-4">Title</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Syllabus</th>
                            {/* CONDITIONAL COLUMN: Only show Action if 'For Approval' */}
                            {activeTab === 'For Approval' && (
                                <th className="p-4 text-center">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSubjects.length === 0 ? (
                             <tr><td colSpan={activeTab === 'For Approval' ? 6 : 5} className="p-8 text-center text-gray-400 italic">No subjects found.</td></tr>
                        ) : (
                            filteredSubjects.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${sub.type === 'IP Specialization' ? 'bg-purple-100 text-purple-800' : 
                                              sub.type === 'Elective' ? 'bg-green-100 text-green-800' : 
                                              'bg-blue-100 text-blue-800'}`}>
                                            {sub.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-gray-700">{sub.code}</td>
                                    <td className="p-4 text-gray-600">{sub.title}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                                            ${sub.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                              'bg-orange-100 text-orange-700'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 bg-blue-50 px-3 py-1 rounded flex items-center gap-1 mx-auto">
                                            <FileText size={12} /> View
                                        </button>
                                    </td>
                                    
                                    {/* ACTION BUTTONS (Only for For Approval) */}
                                    {activeTab === 'For Approval' && (
                                        <td className="p-4 text-center space-x-2 flex justify-center">
                                            <button 
                                                onClick={() => handleApprove(sub.id)}
                                                className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 transition-colors" 
                                                title="Approve"
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDecline(sub.id)}
                                                className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors" 
                                                title="Decline (Delete)"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        // Empty State
        !loading && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-500">Select an Institution and Campus to view subjects</h3>
            </div>
        )
      )}
    </div>
  );
};

export default AdminSubjects;
