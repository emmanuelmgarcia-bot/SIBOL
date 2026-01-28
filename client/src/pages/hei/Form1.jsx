import React, { useState, useEffect } from 'react';

const Form1 = () => {
  const [rowsA, setRowsA] = useState([]);
  const [rowsB, setRowsB] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [inputA, setInputA] = useState({ subject: '', program: '', faculty: '' });
  // Inputs for Section B (Elective)
  const [inputB, setInputB] = useState({ subject: '', program: '', faculty: '' });

  const [integratedSubjects, setIntegratedSubjects] = useState([]);
  const [electiveSubjects, setElectiveSubjects] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [facultyEducation, setFacultyEducation] = useState({});
  const [facultyStatus, setFacultyStatus] = useState({});

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const getHeiInfo = () => {
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    return {
      heiId: user?.hei_id
    };
  };

  useEffect(() => {
    const loadOptions = async () => {
      const { heiId } = getHeiInfo();
      if (!heiId) return;

      try {
        const subjectsRes = await fetch(`${apiBase}/api/heis/subjects?heiId=${encodeURIComponent(heiId)}&status=Approved`);
        const subjectsData = await subjectsRes.json();
        if (subjectsRes.ok && Array.isArray(subjectsData)) {
          const integrated = subjectsData.filter(s => s.type === 'Integrated');
          const elective = subjectsData.filter(s => s.type === 'Elective');
          setIntegratedSubjects(integrated.map(s => `${s.code} - ${s.title}`));
          setElectiveSubjects(elective.map(s => `${s.code} - ${s.title}`));
        }

        const programsRes = await fetch(`${apiBase}/api/heis/programs/master`);
        const programsData = await programsRes.json();
        if (programsRes.ok && Array.isArray(programsData)) {
          setProgramOptions(
            programsData.map(p => {
              const title = p.title || '';
              if (title.length > 15) {
                return p.code;
              }
              return `${p.code} - ${title}`;
            })
          );
        }

        const facultyRes = await fetch(`${apiBase}/api/heis/faculty?heiId=${encodeURIComponent(heiId)}`);
        const facultyData = await facultyRes.json();
        if (facultyRes.ok && Array.isArray(facultyData)) {
          setFacultyOptions(facultyData.map(f => f.name));
          const eduMap = {};
          const statusMap = {};
          facultyData.forEach(f => {
            eduMap[f.name] = f.education;
            statusMap[f.name] = f.status;
          });
          setFacultyEducation(eduMap);
          setFacultyStatus(statusMap);
        }
      } catch (err) {
        console.error('Error loading form 1 options:', err);
      }
    };

    loadOptions();
  }, []);

  const addRowA = () => {
    if (!inputA.subject || !inputA.faculty || !inputA.program) return;
    const education = facultyEducation[inputA.faculty] || '';
    const status = facultyStatus[inputA.faculty] || 'Permanent';
    setRowsA([...rowsA, { id: Date.now(), ...inputA, units: 3, status, education }]);
    setInputA({ subject: '', program: '', faculty: '' });
  };

  const addRowB = () => {
    if (!inputB.subject || !inputB.faculty || !inputB.program) return;
    const education = facultyEducation[inputB.faculty] || '';
    const status = facultyStatus[inputB.faculty] || 'Contractual';
    setRowsB([...rowsB, { id: Date.now(), ...inputB, units: 3, status, education }]);
    setInputB({ subject: '', program: '', faculty: '' });
  };

  const handleSubmit = async () => {
    if (rowsA.length === 0 && rowsB.length === 0) {
      alert('No data to submit.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        integrated: rowsA,
        elective: rowsB
      };
      const json = JSON.stringify(payload);
      const base64 = btoa(unescape(encodeURIComponent(json)));
      const userRaw = localStorage.getItem('sibol_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      const heiId = user && user.hei_id ? user.hei_id : null;
      const apiBase =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : '';
      const response = await fetch(`${apiBase}/api/heis/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          heiId,
          campus: 'MAIN',
          formType: 'form1',
          fileName: `form1-${new Date().toISOString().slice(0, 10)}.json`,
          mimeType: 'application/json',
          fileBase64: base64
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      alert('Form 1 submitted successfully.');
    } catch (err) {
      console.error('Form 1 submit error:', err);
      alert(err.message || 'Failed to submit Form 1');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">HEI Form 1 Submission</h1>
            <p className="text-sm text-gray-500">Integrated & Elective IP Studies</p>
        </div>
        <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold border border-yellow-200">
            Draft Mode
        </span>
      </div>

      {/* ================= SECTION A: Integrated ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            A. Integrated/Incorporated Subject
        </h2>
        
        {/* Input Bar A */}
        <div className="flex flex-wrap gap-4 mb-4 bg-blue-50 p-5 rounded-lg border border-blue-100 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Subject</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={inputA.subject} onChange={e => setInputA({...inputA, subject: e.target.value})}>
              <option value="">Select Subject...</option>
              {integratedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Degree Program</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={inputA.program} onChange={e => setInputA({...inputA, program: e.target.value})}>
              <option value="">Select Program...</option>
              {programOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Faculty Handling</label>
             <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={inputA.faculty} onChange={e => setInputA({...inputA, faculty: e.target.value})}>
              <option value="">Select Faculty...</option>
              {facultyOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button onClick={addRowA} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-bold h-[38px]">ADD</button>
        </div>

        {/* Table A */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 font-bold text-gray-700">
              <tr>
                <th className="p-3 border-r">Name of Subject(s)</th>
                <th className="p-3 border-r w-16 text-center">Units</th>
                <th className="p-3 border-r">Degree Program/s</th>
                <th className="p-3 border-r">Faculty Handling</th>
                <th className="p-3 border-r">Status</th>
                <th className="p-3 border-r">Education</th>
                <th className="p-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rowsA.length === 0 ? <tr><td colSpan="7" className="p-4 text-center text-gray-400 italic">No integrated subjects added.</td></tr> : rowsA.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50">
                    <td className="p-3 border-r font-medium text-gray-800">{row.subject}</td>
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

      {/* ================= SECTION B: Elective ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            B. Elective Subject
        </h2>
        
        {/* Input Bar B */}
        <div className="flex flex-wrap gap-4 mb-4 bg-green-50 p-5 rounded-lg border border-green-100 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-green-800 uppercase mb-1 block">Subject</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" value={inputB.subject} onChange={e => setInputB({...inputB, subject: e.target.value})}>
              <option value="">Select Subject...</option>
              {electiveSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-green-800 uppercase mb-1 block">Degree Program</label>
            <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" value={inputB.program} onChange={e => setInputB({...inputB, program: e.target.value})}>
              <option value="">Select Program...</option>
              {programOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-bold text-green-800 uppercase mb-1 block">Faculty Handling</label>
             <select className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" value={inputB.faculty} onChange={e => setInputB({...inputB, faculty: e.target.value})}>
              <option value="">Select Faculty...</option>
              {facultyOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button onClick={addRowB} className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold h-[38px]">ADD</button>
        </div>

        {/* Table B */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 font-bold text-gray-700">
              <tr>
                <th className="p-3 border-r">Name of Subject(s)</th>
                <th className="p-3 border-r w-16 text-center">Units</th>
                <th className="p-3 border-r">Degree Program/s</th>
                <th className="p-3 border-r">Faculty Handling</th>
                <th className="p-3 border-r">Status</th>
                <th className="p-3 border-r">Education</th>
                <th className="p-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rowsB.length === 0 ? <tr><td colSpan="7" className="p-4 text-center text-gray-400 italic">No elective subjects added.</td></tr> : rowsB.map(row => (
                  <tr key={row.id} className="hover:bg-green-50">
                    <td className="p-3 border-r font-medium text-gray-800">{row.subject}</td>
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

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transform transition-all ${
            submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700 hover:scale-105'
          }`}
        >
            <span className="text-xl">✓</span> {submitting ? 'Submitting...' : 'Submit Form 1'}
        </button>
      </div>
    </div>
  );
};

export default Form1;
