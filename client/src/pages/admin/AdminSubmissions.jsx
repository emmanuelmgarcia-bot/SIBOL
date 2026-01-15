import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Building2, MapPin, FileText, Download, Eye, Calendar } from 'lucide-react';

const AdminSubmissions = () => {
  // ==========================================
  // 1. HEI & CAMPUS SELECTION STATE (ADMIN ONLY)
  // ==========================================
  const [heiList, setHeiList] = useState([]);
  const [heiSearch, setHeiSearch] = useState('');
  const [selectedHei, setSelectedHei] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [showHeiList, setShowHeiList] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);

  // ==========================================
  // 2. SUBMISSION TABLE STATE (FROM HEISubmissions)
  // ==========================================
  const [activeTab, setActiveTab] = useState('Form 1'); // 'Form 1' or 'Form 2'

  // Mock Data: Form 1
  const [submissionsForm1, setSubmissionsForm1] = useState([
    { 
      id: 'SUB-F1-2024', 
      name: 'Form 1 Submission - AY 2024-2025',
      date: 'August 15, 2024', 
    },
    { 
      id: 'SUB-F1-2023', 
      name: 'Form 1 Submission - AY 2023-2024',
      date: 'August 10, 2023', 
    },
  ]);

  // Mock Data: Form 2
  const [submissionsForm2, setSubmissionsForm2] = useState([
    { 
      id: 'SUB-F2-2024', 
      name: 'Form 2 Submission - AY 2024-2025',
      date: 'September 01, 2024', 
    },
    { 
      id: 'SUB-F2-2023', 
      name: 'Form 2 Submission - AY 2023-2024',
      date: 'September 05, 2023', 
    },
  ]);

  // --- FETCH HEI DATA ---
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

  return (
    <div className="space-y-6">
      
      {/* ========================================== */}
      {/* HEADER: HEI/CAMPUS SELECTION (ADMIN)       */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building2 className="text-blue-600" /> 
            HEI Submissions
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

      {/* ========================================== */}
      {/* CONTENT: SUBMISSION HISTORY TABLE          */}
      {/* ========================================== */}
      {selectedHei && selectedCampus ? (
        <div className="space-y-6 animate-fade-in">
             
             {/* Header Info */}
             <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedHei.hei}</h3>
                <p className="text-sm text-blue-600 font-medium">{selectedCampus} Campus</p>
             </div>

             {/* TABS (Replicated from HEISubmissions.jsx) */}
             <div className="flex border-b border-gray-200">
                <button
                onClick={() => setActiveTab('Form 1')}
                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'Form 1'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                >
                <FileText size={18} />
                Form 1 (Subjects)
                </button>
                <button
                onClick={() => setActiveTab('Form 2')}
                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'Form 2'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                >
                <FileText size={18} />
                Form 2 (Programs)
                </button>
            </div>

            {/* TABLE CONTENT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* === FORM 1 TABLE === */}
                {activeTab === 'Form 1' && (
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                    <tr>
                        <th className="p-4 w-2/3">Submission Name</th>
                        <th className="p-4">Date Submitted</th>
                        <th className="p-4 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {submissionsForm1.length === 0 ? (
                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">No submissions found.</td></tr>
                    ) : (
                        submissionsForm1.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-gray-800 text-base">{item.name}</div>
                                <div className="text-xs text-blue-500 font-mono mt-1">{item.id}</div>
                            </td>
                            <td className="p-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} /> {item.date}
                            </div>
                            </td>
                            <td className="p-4 text-center flex justify-center gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition-colors">
                                <Eye size={14} /> View
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded text-xs font-bold transition-colors">
                                <Download size={14} /> Download
                            </button>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                )}

                {/* === FORM 2 TABLE === */}
                {activeTab === 'Form 2' && (
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                    <tr>
                        <th className="p-4 w-2/3">Submission Name</th>
                        <th className="p-4">Date Submitted</th>
                        <th className="p-4 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {submissionsForm2.length === 0 ? (
                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">No submissions found.</td></tr>
                    ) : (
                        submissionsForm2.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-gray-800 text-base">{item.name}</div>
                                <div className="text-xs text-blue-500 font-mono mt-1">{item.id}</div>
                            </td>
                            <td className="p-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} /> {item.date}
                            </div>
                            </td>
                            <td className="p-4 text-center flex justify-center gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition-colors">
                                <Eye size={14} /> View
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded text-xs font-bold transition-colors">
                                <Download size={14} /> Download
                            </button>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                )}
            </div>
        </div>
      ) : (
        // Empty State
        !loading && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-500">Select an Institution and Campus to view submissions</h3>
            </div>
        )
      )}
    </div>
  );
};

export default AdminSubmissions;