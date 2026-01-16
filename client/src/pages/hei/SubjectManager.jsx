import React, { useState, useEffect } from 'react';

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form Initial State
  const initialFormState = {
    type: 'Integrated', // Default
    code: '',
    title: '',
    syllabusFile: null,
    // Conditional Fields
    units: '',
    govtAuthority: '',
    ayStarted: '',
    studentsAy1: '',
    studentsAy2: '',
    studentsAy3: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const getHeiInfo = () => {
      const userRaw = localStorage.getItem('sibol_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      return {
          heiId: user?.hei_id,
          campus: 'MAIN' // Default
      };
  };

  const fetchSubjects = async () => {
    const { heiId, campus } = getHeiInfo();
    if (!heiId) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/heis/subjects?heiId=${encodeURIComponent(heiId)}&campus=${encodeURIComponent(campus)}`);
      const data = await res.json();
      if (res.ok) {
        setSubjects(data);
      } else {
        console.error('Failed to fetch subjects:', data.error);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
        try {
            const res = await fetch(`${apiBase}/api/heis/subjects/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSubjects(subjects.filter(s => s.id !== id));
            } else {
                alert('Failed to delete subject');
            }
        } catch (err) {
            console.error('Error deleting subject:', err);
            alert('Error deleting subject');
        }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.syllabusFile) {
        alert('Please upload a syllabus file.');
        return;
    }

    const file = formData.syllabusFile;
    const isPdf =
      (file.type && file.type.toLowerCase().includes('pdf')) ||
      (file.name && file.name.toLowerCase().endsWith('.pdf'));

    if (!isPdf) {
        alert('Please upload a PDF file for the syllabus.');
        return;
    }

    try {
        setSaving(true);
        const { heiId, campus } = getHeiInfo();

        // Convert file to base64
        const readerResult = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(formData.syllabusFile);
        });
        const base64 = typeof readerResult === 'string' ? readerResult.split(',')[1] : '';

        const payload = {
            heiId,
            campus,
            type: formData.type,
            code: formData.code,
            title: formData.title,
            units: formData.units,
            govtAuthority: formData.govtAuthority,
            ayStarted: formData.ayStarted,
            studentsAy1: formData.studentsAy1,
            studentsAy2: formData.studentsAy2,
            studentsAy3: formData.studentsAy3,
            fileName: formData.syllabusFile.name,
            mimeType: formData.syllabusFile.type || 'application/pdf',
            fileBase64: base64
        };

        const response = await fetch(`${apiBase}/api/heis/subjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        // Add to list
        setSubjects([data, ...subjects]);
        setIsModalOpen(false);
        alert('Subject submitted for approval!');

    } catch (err) {
        console.error('Subject upload error:', err);
        alert(err.message || 'Failed to upload subject');
    } finally {
        setSaving(false);
    }
  };

  // Filter Logic
  const filteredSubjects = subjects.filter(sub => activeTab === 'All' ? true : sub.status === activeTab);

  // Helper Check
  const isIPDegreeProgram = formData.type === 'Degree Program';

  return (
    <div className="space-y-6">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Subject Manager</h1>
            <p className="text-sm text-gray-500">Manage IP Subjects and IP Degree Programs/Specializations</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                {['All', 'Approved', 'For Approval', 'Declined'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-md transition-all ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab}
                    </button>
                ))}
            </div>
            <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 font-bold flex items-center gap-2 text-sm">
                + Add Entry
            </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                <tr>
                    <th className="p-4 border-b">Type</th>
                    <th className="p-4 border-b">Code</th>
                    <th className="p-4 border-b">Descriptive Title</th>
                    <th className="p-4 border-b text-center">Status</th>
                    <th className="p-4 border-b text-center">Syllabus</th>
                    <th className="p-4 border-b text-center">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                     <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading...</td></tr>
                ) : filteredSubjects.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">No items found.</td></tr>
                ) : (
                    filteredSubjects.map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                    ${sub.type === 'Degree Program' ? 'bg-indigo-100 text-indigo-800' : 
                                      sub.type === 'Elective' ? 'bg-green-100 text-green-800' : 
                                      'bg-blue-100 text-blue-800'}`}>
                                    {sub.type === 'Degree Program' ? 'IP Specialization' : sub.type}
                                </span>
                            </td>
                            <td className="p-4 font-bold text-gray-700">{sub.code}</td>
                            <td className="p-4 text-gray-600">
                                <div>{sub.title}</div>
                                {sub.type === 'Degree Program' && sub.govt_authority && (
                                    <div className="text-[10px] text-indigo-600 mt-1">
                                        Auth: {sub.govt_authority} | Students: {sub.students_ay3 || 0}
                                    </div>
                                )}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto ${
                                    sub.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                    sub.status === 'Declined' ? 'bg-red-100 text-red-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        sub.status === 'Approved' ? 'bg-green-500' : 
                                        sub.status === 'Declined' ? 'bg-red-500' :
                                        'bg-orange-500'
                                    }`}></span>
                                    {sub.status}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                {sub.syllabus_view_link ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                          window.open(sub.syllabus_view_link, '_blank', 'noopener,noreferrer');
                                      }}
                                      className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 bg-blue-50 px-3 py-1 rounded"
                                    >
                                        📄 View Syllabus
                                    </button>
                                ) : <span className="text-gray-400 text-xs italic">No file</span>}
                            </td>
                            <td className="p-4 text-center space-x-2">
                                <button onClick={() => handleDelete(sub.id)} className="text-gray-500 hover:text-red-600 font-bold text-xs uppercase">Delete</button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Add Entry</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    
                    {/* 1. CLASSIFICATION (Includes IP Degree Program) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Classification</label>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="Integrated">Integrated / Incorporated Subject</option>
                            <option value="Elective">Elective Subject</option>
                            <option value="Degree Program">Degree Program / Area of Specialization</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                {isIPDegreeProgram ? 'Program Code (e.g., BA IS)' : 'Subject Code (e.g., GEC 101)'}
                            </label>
                            <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                {isIPDegreeProgram ? 'Specialization Name' : 'Descriptive Title'}
                            </label>
                            <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                        </div>
                    </div>

                    {/* ALWAYS ASK FOR SYLLABUS */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload Syllabus (PDF only)</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            onChange={(e) => setFormData({...formData, syllabusFile: e.target.files[0]})}
                            required
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Required for approval. PDF files only.</p>
                    </div>

                    {/* --- CONDITIONAL: STANDARD SUBJECTS (UNITS) --- */}
                    {!isIPDegreeProgram && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                             <label className="block text-xs font-bold text-blue-800 uppercase mb-1">No. of Units</label>
                             <input type="number" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" value={formData.units} onChange={(e) => setFormData({...formData, units: e.target.value})} />
                        </div>
                    )}

                    {/* --- CONDITIONAL: IP DEGREE PROGRAM / SPECIALIZATION --- */}
                    {isIPDegreeProgram && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-4">
                            <h3 className="text-xs font-bold text-indigo-800 border-b border-indigo-200 pb-1">IP Program Details</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Govt Authority</label>
                                    <input type="text" placeholder="e.g. CHED GR No..." className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" value={formData.govtAuthority} onChange={(e) => setFormData({...formData, govtAuthority: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">AY Started</label>
                                    <input type="text" placeholder="e.g. 2018-2019" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" value={formData.ayStarted} onChange={(e) => setFormData({...formData, ayStarted: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">No. of FT Students (Last 3 Years)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="number" placeholder="AY 22-23" className="w-full p-2 border border-gray-300 rounded text-sm text-center" value={formData.studentsAy1} onChange={(e) => setFormData({...formData, studentsAy1: e.target.value})} />
                                    <input type="number" placeholder="AY 23-24" className="w-full p-2 border border-gray-300 rounded text-sm text-center" value={formData.studentsAy2} onChange={(e) => setFormData({...formData, studentsAy2: e.target.value})} />
                                    <input type="number" placeholder="AY 24-25" className="w-full p-2 border border-gray-300 rounded text-sm text-center" value={formData.studentsAy3} onChange={(e) => setFormData({...formData, studentsAy3: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className={`px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
