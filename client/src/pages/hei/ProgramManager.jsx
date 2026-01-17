import React, { useState, useEffect } from 'react';

const ProgramManager = () => {
  const [masterPrograms, setMasterPrograms] = useState([]);
  const [myPrograms, setMyPrograms] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editCurriculumFile, setEditCurriculumFile] = useState(null);
  
  // Form State
  const [selectedProgramCode, setSelectedProgramCode] = useState('');
  const [curriculumFile, setCurriculumFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  // Load Master Programs and My Requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Master Programs
        const masterRes = await fetch(`${apiBase}/api/heis/programs/master`);
        const masterData = await masterRes.json();
        if (masterRes.ok && Array.isArray(masterData)) {
          setMasterPrograms(masterData);
        }

        // 2. Fetch My Program Requests
        const userRaw = localStorage.getItem('sibol_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const heiId = user && user.hei_id ? user.hei_id : null;

        if (heiId) {
            const requestsRes = await fetch(`${apiBase}/api/heis/programs/requests?heiId=${encodeURIComponent(heiId)}`);
            const requestsData = await requestsRes.json();
            if (requestsRes.ok && Array.isArray(requestsData)) {
                setMyPrograms(requestsData);
            }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBase]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProgramCode) return;

    const programDetails = masterPrograms.find(p => p.code === selectedProgramCode);
    if (!programDetails) return;

    try {
        setSaving(true);

        const userRaw = localStorage.getItem('sibol_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const heiId = user && user.hei_id ? user.hei_id : null;

        if (!heiId) {
            throw new Error('User HEI ID not found');
        }

        const payload = {
          heiId,
          programCode: programDetails.code,
          programTitle: programDetails.title
        };

        if (curriculumFile) {
          const isPdf =
            (curriculumFile.type && curriculumFile.type.toLowerCase().includes('pdf')) ||
            (curriculumFile.name && curriculumFile.name.toLowerCase().endsWith('.pdf'));

          if (!isPdf) {
            alert('Please upload a PDF file for the curriculum.');
            return;
          }

          const readerResult = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(curriculumFile);
          });
          const base64 = typeof readerResult === 'string' ? readerResult.split(',')[1] : '';

          payload.fileName = curriculumFile.name;
          payload.mimeType = curriculumFile.type || 'application/pdf';
          payload.fileBase64 = base64;
        }

        const response = await fetch(`${apiBase}/api/heis/programs/requests`, {
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

        // Add new request to list
        setMyPrograms([data, ...myPrograms]);
        
        setIsModalOpen(false);
        setSelectedProgramCode('');
        setCurriculumFile(null);
        alert('Program curriculum submitted for approval!');

    } catch (err) {
        console.error('Curriculum upload error:', err);
        alert(err.message || 'Failed to upload curriculum file');
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Cancel this program request?');
    if (!confirmed) {
      return;
    }

    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const heiId = user && user.hei_id ? user.hei_id : null;

    if (!heiId) {
      alert('User HEI ID not found');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/heis/programs/requests/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ heiId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel program request');
      }

      setMyPrograms(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete program request error:', err);
      alert(err.message || 'Failed to cancel program request');
    }
  };

  const openEditModal = (prog) => {
    setEditingProgram(prog);
    setEditCurriculumFile(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProgram(null);
    setEditCurriculumFile(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();

    if (!editingProgram) {
      return;
    }

    if (!editCurriculumFile) {
      alert('Please select a curriculum PDF to upload.');
      return;
    }

    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const heiId = user && user.hei_id ? user.hei_id : null;

    if (!heiId) {
      alert('User HEI ID not found');
      return;
    }

    try {
      setEditSaving(true);

      const isPdf =
        (editCurriculumFile.type && editCurriculumFile.type.toLowerCase().includes('pdf')) ||
        (editCurriculumFile.name && editCurriculumFile.name.toLowerCase().endsWith('.pdf'));

      if (!isPdf) {
        alert('Please upload a PDF file for the curriculum.');
        setEditSaving(false);
        return;
      }

      const readerResult = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(editCurriculumFile);
      });

      const base64 = typeof readerResult === 'string' ? readerResult.split(',')[1] : '';

      const payload = {
        heiId,
        programCode: editingProgram.program_code,
        programTitle: editingProgram.program_title,
        fileName: editCurriculumFile.name,
        mimeType: editCurriculumFile.type || 'application/pdf',
        fileBase64: base64
      };

      const response = await fetch(`${apiBase}/api/heis/programs/requests/${encodeURIComponent(editingProgram.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update program request');
      }

      setMyPrograms(prev =>
        prev.map(p => (p.id === data.id ? data : p))
      );

      closeEditModal();
      alert('Curriculum updated and resubmitted for approval.');
    } catch (err) {
      console.error('Update curriculum error:', err);
      alert(err.message || 'Failed to update curriculum file');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Program Manager</h1>
            <p className="text-sm text-gray-500">Adopt CHED programs and upload your curriculum</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold flex items-center gap-2 text-sm">
            + Add Program
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                <tr>
                    <th className="p-4 border-b">Program Code</th>
                    <th className="p-4 border-b">Program Name</th>
                    <th className="p-4 border-b text-center">Curriculum</th>
                    <th className="p-4 border-b text-center">Status</th>
                    <th className="p-4 border-b text-center">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Loading programs...</td></tr>
                ) : myPrograms.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No programs added yet.</td></tr>
                ) : (
                    myPrograms.map(prog => (
                        <tr key={prog.id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold text-indigo-700">{prog.program_code}</td>
                            <td className="p-4 text-gray-700 font-medium">{prog.program_title}</td>
                            <td className="p-4 text-center">
                                {(prog.web_view_link || prog.web_content_link) ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                          window.open(prog.web_view_link || prog.web_content_link, '_blank', 'noopener,noreferrer');
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold border border-indigo-200 bg-indigo-50 px-3 py-1 rounded"
                                    >
                                        📄 View Curriculum
                                    </button>
                                ) : <span className="text-gray-400 text-xs">No file</span>}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto 
                                    ${prog.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                      prog.status === 'Declined' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full 
                                        ${prog.status === 'Approved' ? 'bg-green-500' : 
                                          prog.status === 'Declined' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                    {prog.status}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(prog)}
                                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(prog.id)}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold uppercase"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* ADD PROGRAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-indigo-900">Add Degree Program</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Program (CHED Master List)</label>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedProgramCode}
                            onChange={(e) => setSelectedProgramCode(e.target.value)}
                            required
                        >
                            <option value="">Select a program...</option>
                            {masterPrograms.map(p => (
                                <option key={p.id} value={p.code}>{p.code} - {p.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload Curriculum / Prospectus (PDF only)</label>
                        <input 
                            type="file" 
                            accept="application/pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            onChange={(e) => setCurriculumFile(e.target.files[0])}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Optional for now. If provided, curriculum will be subject to approval (PDF only).</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className={`px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>{saving ? 'Submitting...' : 'Submit for Approval'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {isEditModalOpen && editingProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-indigo-900">Update Curriculum</h2>
                    <button onClick={closeEditModal} className="text-gray-400 hover:text-red-500 font-bold text-2xl">&times;</button>
                </div>
                <form onSubmit={handleEditSave} className="p-6 space-y-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Program</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {editingProgram.program_code} - {editingProgram.program_title}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload New Curriculum (PDF only)</label>
                        <input 
                            type="file" 
                            accept="application/pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            onChange={(e) => setEditCurriculumFile(e.target.files[0])}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editSaving}
                            className={`px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm ${editSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {editSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;
