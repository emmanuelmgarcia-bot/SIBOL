import React, { useState, useEffect, useRef } from 'react';
import { Users, CheckCircle, XCircle, Search, ChevronDown, Building2, MapPin, User, Trash2 } from 'lucide-react';

const regionMap = {
  'Region 1': 'Region I',
  'Region 2': 'Region II',
  'Region 3': 'Region III',
  'Region 4A': 'Region IV-A',
  'Region 4B': 'MIMAROPA',
  'Region 5': 'Region V',
  'Region 6': 'Region VI',
  'Region 7': 'Region VII',
  'Region 8': 'Region VIII',
  'Region 9': 'Region IX',
  'Region 10': 'Region X',
  'Region 11': 'Region XI',
  'Region 12': 'Region XII',
  'Region 13': 'Region XIII'
};

const resolveRegion = (assignedRegion) => {
  if (!assignedRegion) return null;
  if (assignedRegion === 'ALL') return 'ALL';
  return regionMap[assignedRegion] || assignedRegion;
};

const normalizeRegion = (value) => {
  if (!value) return '';
  const str = String(value);
  const insideParensMatch = str.match(/\(([^)]+)\)/);
  const inside = insideParensMatch ? insideParensMatch[1] : str;
  return inside
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

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
        const userRaw = localStorage.getItem('sibol_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const assignedRegion = user ? user.assigned_region : null;
        const adminRegion = resolveRegion(assignedRegion);
        const isSuperAdmin = user && (user.username === 'superched' || user.role === 'superadmin');

        const regionForHeiDirectory = adminRegion && !isSuperAdmin ? adminRegion : 'ALL';

        const heiRes = await fetch(`${apiBase}/api/registrations/hei-directory?region=${encodeURIComponent(regionForHeiDirectory)}`);
        const heiData = await heiRes.json();
        if (!heiRes.ok) {
          throw new Error(heiData.error || 'Failed to load HEI directory');
        }
        if (Array.isArray(heiData)) {
          const list = heiData.map(item => ({
            hei: item.hei,
            campuses: Array.isArray(item.campuses) ? [...item.campuses].sort() : []
          }));
          list.sort((a, b) => a.hei.localeCompare(b.hei));
          setHeiList(list);
        } else {
          setHeiList([]);
        }

        const regRes = await fetch(`${apiBase}/api/registrations?region=ALL`);
          const regData = await regRes.json();
          if (!regRes.ok) {
            throw new Error(regData.error || 'Failed to load registrations');
          }
        const mappedRaw = (regData || []).map(item => {
            const statusRaw = item.status || '';
            const status = statusRaw.trim() || 'For Approval';
            return {
              id: item.id,
              hei: item.hei_name,
              campus: item.campus,
              name: `${item.first_name} ${item.middle_name || ''} ${item.last_name}`.replace(/\s+/g, ' ').trim(),
              username: item.username || '',
              status,
              region: item.region
            };
          });
        const mapped = mappedRaw.filter(item => {
          if (!adminRegion || isSuperAdmin) {
            return true;
          }
          const adminKey = normalizeRegion(adminRegion);
          const itemKey = normalizeRegion(item.region);
          return adminKey === itemKey;
        });
        setRegistrations(mapped);
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
    let region = resolveRegion(user ? user.assigned_region : null);
    if (!region && user && (user.username === 'superched' || user.role === 'superadmin')) {
      region = 'ALL';
    }

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
        const baseMessage = data.error || 'Failed to approve registration';
        const extraHeiMessage = data.hei_message || data.hei_status;
        const fullMessage = extraHeiMessage
          ? `${baseMessage}\n\nHEI record status: ${extraHeiMessage}`
          : baseMessage;
        console.error('Approve registration error (API):', fullMessage);
        alert(fullMessage);
        return;
      }
      setRegistrations(registrations.map(r => r.id === id ? { ...r, status: 'Approved' } : r));

      let messageLines = [];

      if (data.username) {
        messageLines.push(`Account created.`);
        messageLines.push(``);
        messageLines.push(`Username: ${data.username}`);
        messageLines.push(`Default password: CHED@1994`);
      }

      if (data.hei_status || data.hei_message || data.hei_id || data.hei_name) {
        const heiLabel = data.hei_name ? data.hei_name : 'HEI';
        const statusText = data.hei_message
          ? data.hei_message
          : (data.hei_status || 'HEI record status unknown.');

        if (messageLines.length > 0) {
          messageLines.push(``);
        }
        messageLines.push(`HEI: ${heiLabel}`);
        messageLines.push(`HEI record status: ${statusText}`);
      }

      if (messageLines.length > 0) {
        alert(messageLines.join('\n'));
      }
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
    let region = resolveRegion(user ? user.assigned_region : null);
    if (!region && user && (user.username === 'superched' || user.role === 'superadmin')) {
      region = 'ALL';
    }

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
    const status = (reg.status || '').trim() || 'For Approval';

    const matchesTab =
      activeTab === 'For Approval'
        ? status === 'For Approval'
        : status === 'Approved';
    
    const matchesHei = selectedHei ? reg.hei === selectedHei.hei : true;
    const matchesCampus = selectedCampus ? reg.campus === selectedCampus : true;
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
                                    {reg.username && (
                                        <div className="text-xs text-indigo-500 font-mono mt-1 flex items-center gap-1">
                                            <User size={12} /> @{reg.username}
                                        </div>
                                    )}
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
