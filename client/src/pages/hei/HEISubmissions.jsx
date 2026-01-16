import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, Calendar } from 'lucide-react';

const HEISubmissions = () => {
  const [activeTab, setActiveTab] = useState('Form 1');
  const [submissionsForm1, setSubmissionsForm1] = useState([]);
  const [submissionsForm2, setSubmissionsForm2] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const heiId = user && user.hei_id ? user.hei_id : null;
    if (!heiId) {
      setLoading(false);
      return;
    }
    const apiBase =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : '';
    const load = async () => {
      try {
        const response = await fetch(`${apiBase}/api/heis/submissions?heiId=${encodeURIComponent(heiId)}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load submissions');
        }
        const form1 = [];
        const form2 = [];
        data.forEach(item => {
          const entry = {
            id: item.id,
            name: item.file_name,
            date: item.created_at,
            fileId: item.file_id
          };
          if (item.form_type === 'form1') {
            form1.push(entry);
          } else if (item.form_type === 'form2') {
            form2.push(entry);
          }
        });
        setSubmissionsForm1(form1);
        setSubmissionsForm2(form2);
      } catch (err) {
        console.error('Load submissions error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
              {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">Loading submissions...</td></tr>
              ) : submissionsForm1.length === 0 ? (
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
                        <Calendar size={14} /> {new Date(item.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.fileId) {
                            const url = `https://drive.google.com/file/d/${item.fileId}/view`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition-colors"
                      >
                          <Eye size={14} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const apiBase =
                            window.location.hostname === 'localhost'
                              ? 'http://localhost:5000'
                              : '';
                          const url = `${apiBase}/api/heis/submissions/${item.id}/pdf`;
                          window.open(url, '_blank');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded text-xs font-bold transition-colors"
                      >
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
              {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">Loading submissions...</td></tr>
              ) : submissionsForm2.length === 0 ? (
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
                        <Calendar size={14} /> {new Date(item.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.fileId) {
                            const url = `https://drive.google.com/file/d/${item.fileId}/view`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition-colors"
                      >
                          <Eye size={14} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const apiBase =
                            window.location.hostname === 'localhost'
                              ? 'http://localhost:5000'
                              : '';
                          const url = `${apiBase}/api/heis/submissions/${item.id}/pdf`;
                          window.open(url, '_blank');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded text-xs font-bold transition-colors"
                      >
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
