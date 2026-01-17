import React, { useState, useEffect } from 'react';

const FacultyManager = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', status: 'Permanent', education: 'Bachelor\'s' });
  const [filter, setFilter] = useState('All');

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const getHeiInfo = () => {
    const userRaw = localStorage.getItem('sibol_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    return {
      heiId: user?.hei_id
    };
  };

  const fetchFaculty = async () => {
    const { heiId } = getHeiInfo();
    if (!heiId) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/heis/faculty?heiId=${encodeURIComponent(heiId)}`);
      const data = await res.json();
      if (res.ok) {
        setFaculty(data);
      } else {
        console.error('Failed to fetch faculty:', data.error);
      }
    } catch (err) {
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleEdit = (fac) => {
    setFormData(fac);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
      
      try {
          const res = await fetch(`${apiBase}/api/heis/faculty/${id}`, {
              method: 'DELETE'
          });
          
          if (res.ok) {
              fetchFaculty();
          } else {
              const data = await res.json();
              alert('Failed to delete: ' + (data.error || 'Unknown error'));
          }
      } catch (err) {
          console.error('Error deleting:', err);
          alert('Error deleting faculty');
      }
  };

  const handleSubmit = async () => {
      const { heiId } = getHeiInfo();
      if (!heiId) {
          alert('User not authenticated correctly (missing HEI ID)');
          return;
      }

      if (!formData.name) {
          alert('Please enter a name');
          return;
      }

      try {
          let url = `${apiBase}/api/heis/faculty`;
          let method = 'POST';
          let body = {
              heiId,
              name: formData.name,
              status: formData.status,
              education: formData.education
          };

          if (editMode && formData.id) {
              url = `${apiBase}/api/heis/faculty/${formData.id}`;
              method = 'PUT';
              body = {
                  name: formData.name,
                  status: formData.status,
                  education: formData.education
              };
          }

          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          });

          const data = await res.json();
          if (res.ok) {
              alert(editMode ? 'Faculty updated!' : 'Faculty added!');
              setEditMode(false);
              setFormData({ id: null, name: '', status: 'Permanent', education: 'Bachelor\'s' });
              fetchFaculty();
          } else {
              alert('Failed to save: ' + (data.error || 'Unknown error'));
          }
      } catch (err) {
          console.error('Error saving faculty:', err);
          alert('Error saving faculty');
      }
  };

  const filteredFaculty = filter === 'All' ? faculty : faculty.filter(f => f.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Isabela State University <span className="text-sm font-normal text-gray-500 block">Cabagan Campus</span></h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Faculty List {loading && <span className="text-sm font-normal text-gray-500">(Loading...)</span>}</h3>
          <div className="text-xs space-x-2 flex items-center">
            <span className="mr-2">Filter By:</span>
            <label className="cursor-pointer flex items-center space-x-1">
                <input 
                    type="radio" 
                    name="filter" 
                    checked={filter === 'All'} 
                    onChange={() => setFilter('All')} 
                /> 
                <span>All</span>
            </label>
            <label className="cursor-pointer flex items-center space-x-1">
                <input 
                    type="radio" 
                    name="filter" 
                    checked={filter === 'Permanent'} 
                    onChange={() => setFilter('Permanent')} 
                /> 
                <span>Permanent</span>
            </label>
            <label className="cursor-pointer flex items-center space-x-1">
                <input 
                    type="radio" 
                    name="filter" 
                    checked={filter === 'Temporary'} 
                    onChange={() => setFilter('Temporary')} 
                /> 
                <span>Temporary</span>
            </label>
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
            {filteredFaculty.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        {loading ? 'Loading faculty...' : 'No faculty members found.'}
                    </td>
                </tr>
            ) : (
                filteredFaculty.map((fac) => (
                <tr key={fac.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-3 font-medium">{fac.name}</td>
                    <td className="px-6 py-3 text-gray-500">{fac.status}</td>
                    <td className="px-6 py-3 text-gray-500">{fac.education}</td>
                    <td className="px-6 py-3 text-right">
                    <button onClick={() => handleEdit(fac)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(fac.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                    </td>
                </tr>
                ))
            )}
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
                <button onClick={() => {setEditMode(false); setFormData({id: null, name:'', status:'Permanent', education:'Bachelor\'s'})}} className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
             )}
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 shadow-sm transition-all">
              {editMode ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyManager;
