import React, { useState } from 'react';

const FacultyManager = () => {
  const [faculty, setFaculty] = useState([
    { id: 1, name: 'Dr. Maria Santos', status: 'Permanent', education: 'Doctoral' },
    { id: 2, name: 'Mr. John Doe', status: 'Temporary', education: 'Master\'s' },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', status: 'Permanent', education: 'Bachelor\'s' });

  const handleEdit = (fac) => {
    setFormData(fac);
    setEditMode(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Isabela State University <span className="text-sm font-normal text-gray-500 block">Cabagan Campus</span></h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Faculty List</h3>
          <div className="text-xs space-x-2">
            <span>Filter By:</span>
            <label><input type="radio" name="filter" /> Permanent</label>
            <label><input type="radio" name="filter" /> Temporary</label>
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-3">Faculty Name</th>
              <th className="px-6 py-3">Employment Status</th>
              <th className="px-6 py-3">Educational Attainment</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {faculty.map((fac) => (
              <tr key={fac.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-3 font-medium">{fac.name}</td>
                <td className="px-6 py-3 text-gray-500">{fac.status}</td>
                <td className="px-6 py-3 text-gray-500">{fac.education}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => handleEdit(fac)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Edit</button>
                  <button className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
        <h3 className="text-lg font-bold text-gray-800 mb-6">{editMode ? 'Edit Faculty' : 'Add Faculty'}</h3>
        
        <div className="grid gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Juan Dela Cruz"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
            <div className="flex gap-4">
              {['Permanent', 'Temporary', 'COS'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={formData.status === status}
                    onChange={() => setFormData({...formData, status})}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Educational Attainment</label>
            <div className="flex gap-4">
              {['Bachelor\'s', 'Master\'s', 'Doctoral'].map((edu) => (
                <label key={edu} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="education" 
                    checked={formData.education === edu}
                    onChange={() => setFormData({...formData, education: edu})}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{edu}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
             {editMode && (
                <button onClick={() => {setEditMode(false); setFormData({name:'', status:'Permanent', education:'Bachelor\'s'})}} className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
             )}
            <button className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 shadow-sm transition-all">
              {editMode ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyManager;