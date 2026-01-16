import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Building2, MapPin, CheckCircle, XCircle, FileText, GraduationCap, Plus, Trash2 } from 'lucide-react';

const AdminPrograms = () => {
  // ==========================================
  // SECTION 1: MASTER PROGRAM LIST STATE
  // ==========================================
  const [masterPrograms, setMasterPrograms] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({ code: '', title: '' });
  const [masterSearch, setMasterSearch] = useState(''); // NEW: Search State

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  useEffect(() => {
    fetch(`${apiBase}/api/heis/programs/master`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load master programs');
        }
        if (Array.isArray(data)) {
          setMasterPrograms(data);
        } else {
          setMasterPrograms([]);
        }
      })
      .catch(err => {
        console.error('Error loading master programs:', err);
        setMasterPrograms([]);
      });
  }, [apiBase]);

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!newProgram.code || !newProgram.title) {
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/heis/programs/master`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newProgram.code,
          title: newProgram.title
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add program');
      }
      setMasterPrograms([...masterPrograms, data]);
      setNewProgram({ code: '', title: '' });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Add master program error:', err);
      alert(err.message || 'Failed to add program');
    }
  };

  const handleDeleteMaster = async (id) => {
    if (!window.confirm("Delete this program from the master list?")) {
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/heis/programs/master/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete program');
      }
      setMasterPrograms(masterPrograms.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete master program error:', err);
      alert(err.message || 'Failed to delete program');
    }
  };

  // NEW: Filtering Logic
  const filteredMasterPrograms = masterPrograms.filter(p => 
    p.code.toLowerCase().includes(masterSearch.toLowerCase()) || 
    p.title.toLowerCase().includes(masterSearch.toLowerCase())
  );


  // ==========================================
  // SECTION 2: HEI APPROVAL STATE (Existing)
  // ==========================================
  const [heiList, setHeiList] = useState([]);
  const [heiSearch, setHeiSearch] = useState('');
  const [selectedHei, setSelectedHei] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [showHeiList, setShowHeiList] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);

  const [activeTab, setActiveTab] = useState('All'); 
  
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const region = user && user.assigned_region ? user.assigned_region : null;

    if (!region) {
      console.error('Missing assigned region for admin user, cannot load HEI directory');
      setHeiList([]);
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/api/registrations/hei-directory?region=${encodeURIComponent(region)}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load HEI directory');
        }
        if (Array.isArray(data)) {
          const list = data.map(item => ({
            hei: item.hei,
            campuses: Array.isArray(item.campuses) ? [...item.campuses].sort() : []
          }));
          list.sort((a, b) => a.hei.localeCompare(b.hei));
          setHeiList(list);
        } else {
          setHeiList([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading HEI directory:', err);
        setHeiList([]);
        setLoading(false);
      });
  }, []);

  // Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowHeiList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Handlers: Selection
  const handleHeiSelect = (item) => {
    setSelectedHei(item);
    setHeiSearch(item.hei);
    setSelectedCampus('');
    setShowHeiList(false);
  };

  const filteredHeis = heiList.filter(item => 
    item.hei.toLowerCase().includes(heiSearch.toLowerCase())
  );

  useEffect(() => {
    if (!selectedHei || !selectedCampus) {
      setPrograms([]);
      return;
    }
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const region = user && user.assigned_region ? user.assigned_region : null;

    if (!region) {
      setPrograms([]);
      return;
    }

    const params = new URLSearchParams();
    params.append('region', region);
    params.append('heiId', selectedHei.heiId);
    params.append('campus', selectedCampus);
    if (activeTab !== 'All') {
      params.append('status', activeTab);
    }

    fetch(`${apiBase}/api/heis/programs/requests?${params.toString()}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load program requests');
        }
        if (Array.isArray(data)) {
          const mapped = data.map(item => ({
            id: item.id,
            code: item.program_code,
            title: item.program_title,
            status: item.status,
            curriculumViewUrl: item.web_view_link || item.web_content_link || null
          }));
          setPrograms(mapped);
        } else {
          setPrograms([]);
        }
      })
      .catch(err => {
        console.error('Error loading program requests:', err);
        setPrograms([]);
      });
  }, [apiBase, selectedHei, selectedCampus, activeTab]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this program curriculum?")) {
      return;
    }
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const region = user && user.assigned_region ? user.assigned_region : null;
    if (!region) {
      alert('Missing assigned region. Cannot approve program request.');
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/heis/programs/requests/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', region })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve program request');
      }
      setPrograms(programs.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
    } catch (err) {
      console.error('Approve program request error:', err);
      alert(err.message || 'Failed to approve program request');
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm("Decline this program?")) {
      return;
    }
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const region = user && user.assigned_region ? user.assigned_region : null;
    if (!region) {
      alert('Missing assigned region. Cannot decline program request.');
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/heis/programs/requests/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Declined', region })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to decline program request');
      }
      setPrograms(programs.map(p => p.id === id ? { ...p, status: 'Declined' } : p));
    } catch (err) {
      console.error('Decline program request error:', err);
      alert(err.message || 'Failed to decline program request');
    }
  };

  const filteredPrograms = programs.filter(prog => {
    if (activeTab === 'All') return true;
    return prog.status === activeTab;
  });


  return (
    <div className="space-y-10">
      
      {/* ========================================== */}
      {/* SECTION 1: MASTER PROGRAM LIST MANAGEMENT */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* HEADER & ADD BUTTON */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="text-indigo-600" /> 
                    CHED Program Master List
                </h2>
                <p className="text-xs text-gray-500 mt-1">Manage standard programs available for HEIs to adopt.</p>
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold flex items-center gap-2 text-sm shrink-0"
            >
                <Plus size={16} /> Add New Program
            </button>
        </div>

        {/* SEARCH BAR FOR MASTER LIST */}
        <div className="mb-4 relative">
            <input 
                type="text" 
                className="w-full md:w-1/2 p-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Search master list by code or title..."
                value={masterSearch}
                onChange={(e) => setMasterSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        {/* SCROLLABLE TABLE CONTAINER */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
            {/* max-h-64: Limits height to approx 4-5 rows (16rem) 
               overflow-y-auto: Enables scrolling
            */}
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm text-left relative">
                    {/* Sticky Header */}
                    <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 w-1/4 bg-gray-50">Program Code</th>
                            <th className="p-4 w-1/2 bg-gray-50">Program Name</th>
                            <th className="p-4 text-center bg-gray-50">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredMasterPrograms.length === 0 ? (
                            <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">No programs found matching "{masterSearch}".</td></tr>
                        ) : (
                            filteredMasterPrograms.map((prog) => (
                                <tr key={prog.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-indigo-700">{prog.code}</td>
                                    <td className="p-4 text-gray-700 font-medium">{prog.title}</td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleDeleteMaster(prog.id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                                            title="Delete Program"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* DIVIDER */}
      <hr className="border-gray-200" />


      {/* ========================================== */}
      {/* SECTION 2: HEI PROGRAM APPROVAL (EXISTING) */}
      {/* ========================================== */}
      <div className="space-y-6">
        {/* SELECTION HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building2 className="text-blue-600" /> 
                HEI Program Approval
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

        {/* APPROVAL TABLE (Only show if HEI & Campus Selected) */}
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

                {/* Program Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                            <tr>
                                <th className="p-4">Program Code</th>
                                <th className="p-4">Program Name</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Curriculum</th>
                                {activeTab === 'For Approval' && <th className="p-4 text-center">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPrograms.length === 0 ? (
                                <tr><td colSpan={activeTab === 'For Approval' ? 5 : 4} className="p-8 text-center text-gray-400 italic">No programs found.</td></tr>
                            ) : (
                                filteredPrograms.map(prog => (
                                    <tr key={prog.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-bold text-indigo-700">{prog.code}</td>
                                        <td className="p-4 font-medium text-gray-700">{prog.title}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                                                ${prog.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {prog.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {prog.curriculumViewUrl ? (
                                              <button
                                                className="text-indigo-600 hover:text-indigo-800 text-xs font-bold border border-indigo-200 bg-indigo-50 px-3 py-1 rounded flex items-center gap-1 mx-auto"
                                                onClick={() => window.open(prog.curriculumViewUrl, '_blank', 'noopener,noreferrer')}
                                              >
                                                <FileText size={12} /> View
                                              </button>
                                            ) : (
                                              <span className="text-xs text-gray-400">No file</span>
                                            )}
                                        </td>
                                        
                                        {activeTab === 'For Approval' && (
                                            <td className="p-4 text-center space-x-2 flex justify-center">
                                                <button onClick={() => handleApprove(prog.id)} className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 transition-colors" title="Approve">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button onClick={() => handleDecline(prog.id)} className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors" title="Decline">
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
            // Empty State for HEI Selection
            !loading && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">Select an Institution and Campus to view and approve programs</h3>
                </div>
            )
        )}
      </div>

      {/* ======================= */}
      {/* MODAL: ADD NEW PROGRAM  */}
      {/* ======================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-indigo-900">Add Master Program</h2>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-2xl">&times;</button>
                </div>
                <form onSubmit={handleAddProgram} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Program Code</label>
                        <input 
                            type="text" 
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. BS IT"
                            value={newProgram.code}
                            onChange={(e) => setNewProgram({...newProgram, code: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Program Name</label>
                        <input 
                            type="text" 
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Bachelor of Science in Information Technology"
                            value={newProgram.title}
                            onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm">Add Program</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminPrograms;
