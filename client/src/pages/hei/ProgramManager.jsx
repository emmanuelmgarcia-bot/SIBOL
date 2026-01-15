import React, { useState } from 'react';

const ProgramManager = () => {
  // --- MOCK DATA: CHED PROGRAMS (Master List) ---
  const chedPrograms = [
    { code: 'BS IT', title: 'Bachelor of Science in Information Technology' },
    { code: 'BS CS', title: 'Bachelor of Science in Computer Science' },
    { code: 'BS IS', title: 'Bachelor of Science in Information Systems' },
    { code: 'BS Nurs', title: 'Bachelor of Science in Nursing' },
    { code: 'AB PolSci', title: 'Bachelor of Arts in Political Science' },
  ];

  // --- MOCK DATA: HEI's ADOPTED PROGRAMS ---
  const [myPrograms, setMyPrograms] = useState([
    { 
        id: 1, 
        code: 'BS IT', 
        title: 'Bachelor of Science in Information Technology', 
        curriculum: 'bsit_curr_2023.pdf', 
        status: 'Approved' 
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedProgramCode, setSelectedProgramCode] = useState('');
  const [curriculumFile, setCurriculumFile] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedProgramCode) return;

    // Find full details from master list
    const programDetails = chedPrograms.find(p => p.code === selectedProgramCode);

    setMyPrograms([...myPrograms, {
        id: Date.now(),
        ...programDetails,
        curriculum: curriculumFile ? curriculumFile.name : null,
        status: 'For Approval'
    }]);

    setIsModalOpen(false);
    setSelectedProgramCode('');
    setCurriculumFile(null);
  };

  const handleDelete = (id) => {
    if(window.confirm("Remove this program from your list?")) {
        setMyPrograms(myPrograms.filter(p => p.id !== id));
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
                {myPrograms.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No programs added yet.</td></tr>
                ) : (
                    myPrograms.map(prog => (
                        <tr key={prog.id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold text-indigo-700">{prog.code}</td>
                            <td className="p-4 text-gray-700 font-medium">{prog.title}</td>
                            <td className="p-4 text-center">
                                {prog.curriculum ? (
                                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold border border-indigo-200 bg-indigo-50 px-3 py-1 rounded">
                                        📄 View Curriculum
                                    </button>
                                ) : <span className="text-gray-400 text-xs">No file</span>}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto ${prog.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${prog.status === 'Approved' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                    {prog.status}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => handleDelete(prog.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Remove</button>
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
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Program (CHED List)</label>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedProgramCode}
                            onChange={(e) => setSelectedProgramCode(e.target.value)}
                            required
                        >
                            <option value="">Select a program...</option>
                            {chedPrograms.map(p => (
                                <option key={p.code} value={p.code}>{p.code} - {p.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload Curriculum / Prospectus</label>
                        <input 
                            type="file" 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            onChange={(e) => setCurriculumFile(e.target.files[0])}
                            required
                        />
                        <p className="text-[10px] text-gray-400 mt-1">This curriculum will be subject to approval.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm">Add Program</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;