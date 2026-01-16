import React, { useState } from 'react';

const Form2 = () => {
  const [rowsA, setRowsA] = useState([]);
  const [rowsB, setRowsB] = useState([]);
  const [rowsC, setRowsC] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [inputA, setInputA] = useState({ subject: '', program: '', faculty: '' });
  const [inputB, setInputB] = useState({ subject: '', program: '', faculty: '' });
  
  // Section C Inputs (Reduced to just Subject & Faculty)
  const [inputC, setInputC] = useState({ 
    subject: '', // This will act as the "Program/Area of Specialization"
    faculty: ''
  });

  const subjects = ["GEC 101 - Understanding the Self", "IT 101 - Intro to Computing", "PE 101 - Movement", "IP 101 - Indigenous Cultures"];
  const programs = ["BS Info Tech", "BS Civil Eng", "BS Nursing", "AB Pol Sci"];
  const faculties = ["Dr. Maria Santos", "Mr. John Doe", "Ms. Jane Smith"];

  const addRowA = () => {
    if (!inputA.subject || !inputA.faculty) return;
    setRowsA([...rowsA, { id: Date.now(), ...inputA, units: 3, status: 'Permanent', education: 'PhD' }]);
    setInputA({ subject: '', program: '', faculty: '' });
  };

  const addRowB = () => {
    if (!inputB.subject || !inputB.faculty) return;
    setRowsB([...rowsB, { id: Date.now(), ...inputB, units: 3, status: 'Contractual', education: 'MS' }]);
    setInputB({ subject: '', program: '', faculty: '' });
  };

  const addRowC = () => {
    // Basic validation (Only Subject/Specialization & Faculty required now)
    if (!inputC.subject || !inputC.faculty) return;

    setRowsC([...rowsC, { 
      id: Date.now(), 
      ...inputC, 
      // Initialize table columns as empty/dash
      govtAuthority: '-', 
      ayStarted: '-', 
      studentsAy1: '-', 
      studentsAy2: '-', 
      studentsAy3: '-',
      status: 'Permanent', 
      education: 'PhD'     
    }]);

    // Reset form
    setInputC({ subject: '', faculty: '' });
  };

  const handleSubmit = async () => {
    if (rowsA.length === 0 && rowsB.length === 0 && rowsC.length === 0) {
      alert('No data to submit.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        integrated: rowsA,
        elective: rowsB,
        programs: rowsC
      };
      const json = JSON.stringify(payload);
      const base64 = btoa(unescape(encodeURIComponent(json)));
      const userRaw = localStorage.getItem('sibol_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      const heiId = user && user.hei_id ? user.hei_id : null;
      const apiBase =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5001'
          : '';
      const response = await fetch(`${apiBase}/api/heis/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          heiId,
          campus: 'MAIN',
          formType: 'form2',
          fileName: `form2-${new Date().toISOString().slice(0, 10)}.json`,
          mimeType: 'application/json',
          fileBase64: base64
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      alert('Form 2 submitted successfully.');
    } catch (err) {
      console.error('Form 2 submit error:', err);
      alert(err.message || 'Failed to submit Form 2');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">HEI Form 2 Submission</h1>
            <p className="text-sm text-gray-500">Institutional Peace Education</p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-bold border border-blue-200">
            Draft Mode
        </span>
      </div>

      {/* ================= SECTION A (BLUE THEME) ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            A. Integrated/Incorporated Subject
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-4 bg-blue-50 p-5 rounded-lg border border-blue-100 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Subject</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={inputA.subject} onChange={e => setInputA({...inputA, subject: e.target.value})}>
              <option value="">Select Subject...</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Degree Program</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={inputA.program} onChange={e => setInputA({...inputA, program: e.target.value})}>
              <option value="">Select Program...</option>
              {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Faculty Handling</label>
             <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={inputA.faculty} onChange={e => setInputA({...inputA, faculty: e.target.value})}>
              <option value="">Select Faculty...</option>
              {faculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button onClick={addRowA} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-bold h-[38px]">ADD</button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 font-bold text-gray-700">
              <tr>
                <th className="p-3 border-r">Name of Subject(s)</th>
                <th className="p-3 border-r w-16 text-center">Units</th>
                <th className="p-3 border-r">Degree Program</th>
                <th className="p-3 border-r">Faculty Handling</th>
                <th className="p-3 border-r">Status</th>
                <th className="p-3 border-r">Education</th>
                <th className="p-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rowsA.length === 0 ? <tr><td colSpan="7" className="p-4 text-center text-gray-400 italic">No data added.</td></tr> : rowsA.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50">
                    <td className="p-3 border-r">{row.subject}</td>
                    <td className="p-3 border-r text-center">{row.units}</td>
                    <td className="p-3 border-r">{row.program}</td>
                    <td className="p-3 border-r">{row.faculty}</td>
                    <td className="p-3 border-r">{row.status}</td>
                    <td className="p-3 border-r">{row.education}</td>
                    <td className="p-3 text-center"><button onClick={() => setRowsA(rowsA.filter(r => r.id !== row.id))} className="text-red-500 hover:text-red-700 font-bold">Delete</button></td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= SECTION B (GREEN THEME) ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            B. Elective Subject
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-4 bg-green-50 p-5 rounded-lg border border-green-100 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-green-800 uppercase mb-1 block">Subject</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" value={inputB.subject} onChange={e => setInputB({...inputB, subject: e.target.value})}>
              <option value="">Select Subject...</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-green-800 uppercase mb-1 block">Degree Program</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" value={inputB.program} onChange={e => setInputB({...inputB, program: e.target.value})}>
              <option value="">Select Program...</option>
              {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-bold text-green-800 uppercase mb-1 block">Faculty Handling</label>
             <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" value={inputB.faculty} onChange={e => setInputB({...inputB, faculty: e.target.value})}>
              <option value="">Select Faculty...</option>
              {faculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button onClick={addRowB} className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold h-[38px]">ADD</button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 font-bold text-gray-700">
              <tr>
                <th className="p-3 border-r">Name of Subject(s)</th>
                <th className="p-3 border-r w-16 text-center">Units</th>
                <th className="p-3 border-r">Degree Program</th>
                <th className="p-3 border-r">Faculty Handling</th>
                <th className="p-3 border-r">Status</th>
                <th className="p-3 border-r">Education</th>
                <th className="p-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rowsB.length === 0 ? <tr><td colSpan="7" className="p-4 text-center text-gray-400 italic">No data added.</td></tr> : rowsB.map(row => (
                  <tr key={row.id} className="hover:bg-green-50">
                    <td className="p-3 border-r">{row.subject}</td>
                    <td className="p-3 border-r text-center">{row.units}</td>
                    <td className="p-3 border-r">{row.program}</td>
                    <td className="p-3 border-r">{row.faculty}</td>
                    <td className="p-3 border-r">{row.status}</td>
                    <td className="p-3 border-r">{row.education}</td>
                    <td className="p-3 text-center"><button onClick={() => setRowsB(rowsB.filter(r => r.id !== row.id))} className="text-red-500 hover:text-red-700 font-bold">Delete</button></td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= SECTION C (RED THEME) ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            C. Degree Program/Area of Specialization
        </h2>
        
       {/* Input Bar C */}
        <div className="flex flex-wrap gap-4 mb-4 bg-red-50 p-5 rounded-lg border border-red-100 items-end">
            <div className="flex-1 min-w-[200px]">
                {/* RENAMED LABEL */}
                <label className="text-xs font-bold text-red-800 uppercase mb-1 block">Program/Area of Specialization</label>
                <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-red-500" value={inputC.subject} onChange={e => setInputC({...inputC, subject: e.target.value})}>
                    <option value="">Select Specialization...</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
            {/* REMOVED DEGREE PROGRAM DROPDOWN */}
            
            <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-red-800 uppercase mb-1 block">Faculty Handling</label>
                <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-red-500" value={inputC.faculty} onChange={e => setInputC({...inputC, faculty: e.target.value})}>
                    <option value="">Select Faculty...</option>
                    {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
            </div>
            <button onClick={addRowC} className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 font-bold h-[38px]">ADD</button>
        </div>

        {/* Table C - Columns for Future Data */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-gray-100 font-bold text-gray-700">
              <tr>
                <th rowSpan="2" className="p-3 border-r border-gray-200">Program / Specialization</th>
                <th rowSpan="2" className="p-3 border-r border-gray-200 w-24">Govt Authority</th>
                <th rowSpan="2" className="p-3 border-r border-gray-200 w-24">AY Started</th>
                <th colSpan="3" className="p-2 border-r border-gray-200 text-center border-b border-gray-200">No. of FT Students (1st Sem)</th>
                <th rowSpan="2" className="p-3 border-r border-gray-200">Faculty Handling</th>
                <th rowSpan="2" className="p-3 border-r border-gray-200">Status</th>
                <th rowSpan="2" className="p-3 border-r border-gray-200">Education</th>
                <th rowSpan="2" className="p-3 text-center">Action</th>
              </tr>
              <tr>
                <th className="p-2 border-r border-gray-200 text-center bg-gray-100">AY 22-23</th>
                <th className="p-2 border-r border-gray-200 text-center bg-gray-100">AY 23-24</th>
                <th className="p-2 border-r border-gray-200 text-center bg-gray-100">AY 24-25</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rowsC.length === 0 ? <tr><td colSpan="11" className="p-4 text-center text-gray-500 italic bg-gray-50">No data added.</td></tr> : rowsC.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-3 border-r font-medium text-gray-900">
                        {/* Display the Specialization (formerly Subject) as the main text */}
                        <div>{row.subject}</div>
                    </td>
                    <td className="p-3 border-r text-center text-gray-400">{row.govtAuthority}</td>
                    <td className="p-3 border-r text-center text-gray-400">{row.ayStarted}</td>
                    <td className="p-3 border-r text-center bg-gray-50 text-gray-400">{row.studentsAy1}</td>
                    <td className="p-3 border-r text-center bg-gray-50 text-gray-400">{row.studentsAy2}</td>
                    <td className="p-3 border-r text-center bg-gray-50 text-gray-400">{row.studentsAy3}</td>
                    <td className="p-3 border-r">{row.faculty}</td>
                    <td className="p-3 border-r">{row.status}</td>
                    <td className="p-3 border-r">{row.education}</td>
                    <td className="p-3 text-center">
                        <button onClick={() => setRowsC(rowsC.filter(r => r.id !== row.id))} className="text-red-500 hover:underline font-bold">Delete</button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transform transition-all ${
            submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700 hover:scale-105'
          }`}
        >
            <span className="text-xl">✓</span> {submitting ? 'Submitting...' : 'Submit Form 2'}
        </button>
      </div>
    </div>
  );
};

export default Form2;
