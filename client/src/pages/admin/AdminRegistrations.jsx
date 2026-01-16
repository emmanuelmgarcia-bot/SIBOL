import React, { useState, useEffect, useRef } from 'react';
import { Users, CheckCircle, XCircle, Search, ChevronDown, Building2, MapPin, User, Trash2 } from 'lucide-react';

const AdminRegistrations = () => {
  // ==========================================
  // 1. HEI & CAMPUS SELECTION STATE (FILTERS)
  // ==========================================
  const [heiList, setHeiList] = useState([]);
  const [heiSearch, setHeiSearch] = useState('');
  const [selectedHei, setSelectedHei] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [showHeiList, setShowHeiList] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);

  // ==========================================
  // 2. REGISTRATION MANAGEMENT STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState('For Approval'); // 'For Approval', 'Approved'
  const [searchQuery, setSearchQuery] = useState('');

  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    const load = async () => {
      try {
        const heiRes = await fetch(`${apiBase}/api/heis`);
        const heiData = await heiRes.json();
        if (Array.isArray(heiData)) {
          const grouped = heiData.reduce((acc, item) => {
            const key = item.name;
            if (!acc[key]) {
              acc[key] = {
                heiId: item.id,
                hei: item.name,
                campuses: []
              };
            }
            if (item.campus && !acc[key].campuses.includes(item.campus)) {
              acc[key].campuses.push(item.campus);
            }
            return acc;
          }, {});
          const list = Object.values(grouped);
          list.forEach(entry => entry.campuses.sort());
          list.sort((a, b) => a.hei.localeCompare(b.hei));
          setHeiList(list);
        }

        const userRaw = localStorage.getItem('sibol_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const region = user && user.assigned_region ? user.assigned_region : null;

        if (region) {
          const regRes = await fetch(`${apiBase}/api/registrations?region=${encodeURIComponent(region)}`);
          const regData = await regRes.json();
          if (!regRes.ok) {
            throw new Error(regData.error || 'Failed to load registrations');
          }
          const mapped = (regData || []).map(item => ({
            id: item.id,
            hei: item.hei_name,
            campus: item.campus,
            name: `${item.first_name} ${item.middle_name || ''} ${item.last_name}`.replace(/\s+/g, ' ').trim(),
            username: item.hei_name,
            status: item.status,
            region: item.region
          }));
          setRegistrations(mapped);
        } else {
          setRegistrations([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading admin registrations data:', err);
        setLoading(false);
      }
    };
    load();
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

  // --- HANDLERS: Selection ---
  const handleHeiSelect = (item) => {
    setSelectedHei(item);
    setHeiSearch(item.hei);
    setSelectedCampus('');
    setShowHeiList(false);
  };

  const clearFilters = () => {
    setSelectedHei(null);
    setHeiSearch('');
    setSelectedCampus('');
  };

  const filteredHeis = heiList.filter(item => 
    item.hei.toLowerCase().includes(heiSearch.toLowerCase())
  );

  // --- HANDLERS: Actions ---
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this user registration?")) {
      return;
    }
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const region = user && user.assigned_region ? user.assigned_region : null;
    if (!region) {
      alert('Missing assigned region. Cannot approve.');
      return;
    }
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    try {
      const res = await fetch(`${apiBase}/api/registrations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve registration');
      }
      setRegistrations(registrations.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    } catch (err) {
      console.error('Approve registration error:', err);
      alert(err.message || 'Failed to approve registration');
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm("Decline (Delete) this registration?")) {
      return;
    }
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const region = user && user.assigned_region ? user.assigned_region : null;
    if (!region) {
      alert('Missing assigned region. Cannot delete.');
      return;
    }
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    try {
      const res = await fetch(`${apiBase}/api/registrations/${id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete registration');
      }
      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete registration error:', err);
      alert(err.message || 'Failed to delete registration');
    }
  };
  
  const handleDelete = handleDecline;

  // --- FILTER LOGIC ---
  const filteredRegistrations = registrations.filter(reg => {
    // 1. Tab Filter
    const matchesTab = reg.status === activeTab;
    
    // 2. HEI Filter (If selected, otherwise show all)
    const matchesHei = selectedHei ? reg.hei === selectedHei.hei : true;

    // 3. Campus Filter (If selected, otherwise show all)
    const matchesCampus = selectedCampus ? reg.campus === selectedCampus : true;

    // 4. Search Query
    const matchesSearch = 
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        reg.username.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesHei && matchesCampus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* ========================================== */}
      {/* HEADER & FILTERS                           */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="text-blue-600" /> 
                    User Registrations
                </h2>
                <p className="text-xs text-gray-500 mt-1">Review and approve HEI Admin accounts.</p>
            </div>
            {(selectedHei || heiSearch) && (
                <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline">
                    Clear Filters
                </button>
            )}
        </div>

        {loading ? (
             <div className="text-center py-4 text-gray-500">Loading Institution Data...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HEI Search (Filter) */}
                <div className="relative" ref={wrapperRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filter by HEI</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                            placeholder="All Institutions"
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
                                    <button key={index} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium text-gray-700 border-b border-gray-50 last:border-none" onClick={() => handleHeiSelect(item)}>
                                        {item.hei}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-400 italic">No institutions found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Campus Select (Filter) */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filter by Campus</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none text-sm ${!selectedHei ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-700'}`}
                            value={selectedCampus}
                            onChange={(e) => setSelectedCampus(e.target.value)}
                            disabled={!selectedHei}
                        >
                            <option value="">{selectedHei ? "All Campuses" : "Select HEI first"}</option>
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
      {/* TABLE CONTENT                              */}
      {/* ========================================== */}
      <div className="space-y-4 animate-fade-in">
        
        {/* Secondary Filters: Tabs + Search */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
             {/* Tabs */}
             <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                {['For Approval', 'Approved'].map((tab) => (
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

            {/* Name Search */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                    <tr>
                        <th className="p-4">User Details</th>
                        <th className="p-4">Institution & Campus</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredRegistrations.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">No registrations found matching filters.</td></tr>
                    ) : (
                        filteredRegistrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800 text-base">{reg.name}</div>
                                    <div className="text-xs text-indigo-500 font-mono mt-1 flex items-center gap-1">
                                        <User size={12} /> @{reg.username}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-700 flex items-center gap-1">
                                        <Building2 size={14} className="text-blue-500" /> {reg.hei}
                                    </div>
                                    <div className="text-xs text-gray-500 ml-5 flex items-center gap-1">
                                        <MapPin size={10} /> {reg.campus}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                                        ${reg.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {reg.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center space-x-2 flex justify-center">
                                    {activeTab === 'For Approval' ? (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(reg.id)}
                                                className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 transition-colors" 
                                                title="Approve"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDecline(reg.id)}
                                                className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors" 
                                                title="Decline (Delete)"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => handleDelete(reg.id)}
                                            className="text-gray-400 hover:text-red-600 p-2 transition-colors" 
                                            title="Remove User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrations;
