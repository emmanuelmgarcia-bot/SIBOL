import React, { useState } from 'react';
import { FileText, Eye, Download, Calendar } from 'lucide-react';

const HEISubmissions = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('Form 1'); // 'Form 1' or 'Form 2'

  // --- MOCK DATA: FORM 1 SUBMISSIONS (Integrated & Elective Only) ---
  const submissionsForm1 = [
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
  ];

  // --- MOCK DATA: FORM 2 SUBMISSIONS (Integrated, Elective & Specialization) ---
  const submissionsForm2 = [
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
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Submission History</h1>
        <p className="text-sm text-gray-500">View and download your submitted Form 1 and Form 2 reports.</p>
      </div>

      {/* TABS */}
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

      {/* CONTENT AREA */}
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
  );
};

export default HEISubmissions;