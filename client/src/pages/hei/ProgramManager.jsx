import React, { useState, useEffect } from 'react';

const ProgramManager = () => {
  const [masterPrograms, setMasterPrograms] = useState([]);
  const [myPrograms, setMyPrograms] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedProgramCode, setSelectedProgramCode] = useState('');
  const [curriculumFile, setCurriculumFile] = useState(null);
  const [saving, setSaving] = useState(false);
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
    if (!selectedProgramCode || !curriculumFile) return;

        const programDetails = masterPrograms.find(p => p.code === selectedProgramCode);
    if (!programDetails) return;

        if (!curriculumFile) {
          return;
        }

        const isPdf =
          (curriculumFile.type && curriculumFile.type.toLowerCase().includes('pdf')) ||
          (curriculumFile.name && curriculumFile.name.toLowerCase().endsWith('.pdf'));

        if (!isPdf) {
          alert('Please upload a PDF file for the curriculum.');
          return;
        }

    try {
        setSaving(true);
        
        // Convert file to base64
        const readerResult = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(curriculumFile);
        });
        const base64 = typeof readerResult === 'string' ? readerResult.split(',')[1] : '';

        const userRaw = localStorage.getItem('sibol_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const heiId = user && user.hei_id ? user.hei_id : null;

        if (!heiId) {
            throw new Error('User HEI ID not found');
        }

        const payload = {
            heiId,
            campus: 'MAIN', // Default to MAIN for now, or add campus selector if needed
            programCode: programDetails.code,
            programTitle: programDetails.title,
            fileName: curriculumFile.name,
            mimeType: curriculumFile.type || 'application/pdf',
            fileBase64: base64
        };

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

  const handleDelete = (id) => {
     // For now, maybe just hide it or we need a delete endpoint for requests if they are not approved yet?
     // The requirements didn't specify deleting requests, but usually you can cancel if pending.
     // For now, I'll just show an alert that it's not implemented or remove it from UI state if strictly needed.
     // Since the previous code had a delete, let's leave a placeholder or remove it if not supported by backend.
     // The backend `deleteMasterProgram` is for admins. There is no `deleteProgramRequest` yet.
     alert("Cancellation of requests is not yet supported.");
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
                    {/* <th className="p-4 border-b text-center">Action</th> */}
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
                            {/* <td className="p-4 text-center">
                                <button onClick={() => handleDelete(prog.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Remove</button>
                            </td> */}
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
                            required
                        />
                        <p className="text-[10px] text-gray-400 mt-1">This curriculum will be subject to approval. PDF files only.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className={`px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>{saving ? 'Submitting...' : 'Submit for Approval'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;
