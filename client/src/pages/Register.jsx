import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  // --- STATE: HEI & Campus ---
  const [heiOptions, setHeiOptions] = useState([]);      
  const [campusOptions, setCampusOptions] = useState([]); 
  const [heiMap, setHeiMap] = useState({});               
  
  // Searchable Dropdown State
  const [heiSearch, setHeiSearch] = useState('');        
  const [isHeiOpen, setIsHeiOpen] = useState(false);     

  // --- STATE: Address Data ---
  const [regionOptions, setRegionOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [barangayOptions, setBarangayOptions] = useState([]);

  // --- FORM DATA ---
  const [formData, setFormData] = useState({
    heiName: '',
    campus: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    addressLine1: '',
    addressLine2: '',
    zipCode: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: ''
  });

  const [isManualBarangay, setIsManualBarangay] = useState(false);

  useEffect(() => {
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    fetch(`${apiBase}/api/hei-data`)
      .then(res => res.json())
      .then(data => {
        if (data.list) {
            setHeiOptions(data.list);
            setHeiMap(data.mapping);
        }
      })
      .catch(err => console.error("Error loading HEI data:", err));

    fetch(`${apiBase}/api/regions`)
      .then(res => res.json())
      .then(data => setRegionOptions(data))
      .catch(err => console.error("Error loading regions:", err));
  }, []);

  // --- HANDLER: HEI Selection ---
  const selectHei = (selectedHei) => {
    setHeiSearch(selectedHei);
    setIsHeiOpen(false);
    setFormData(prev => ({ ...prev, heiName: selectedHei, campus: '' }));

    const campuses = heiMap[selectedHei] || [];
    setCampusOptions(campuses.sort());
  };

  // --- HANDLERS: Address Cascading ---

  // 1. Region -> Load Provinces
  const handleRegionChange = (e) => {
    const region = e.target.value;
    setFormData(prev => ({ 
        ...prev, region, province: '', city: '', barangay: '' 
    }));
    setProvinceOptions([]);
    setCityOptions([]);
    setBarangayOptions([]);

    if (region) {
        const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        fetch(`${apiBase}/api/provinces/${encodeURIComponent(region)}`)
            .then(res => res.json())
            .then(data => setProvinceOptions(data));
    }
  };

  // 2. Province -> Load Municipalities
  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData(prev => ({ 
        ...prev, province, city: '', barangay: '' 
    }));
    setCityOptions([]);
    setBarangayOptions([]);

    if (province) {
        const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        fetch(`${apiBase}/api/municipalities/${encodeURIComponent(province)}`)
            .then(res => res.json())
            .then(data => setCityOptions(data));
    }
  };

  // 3. City/Muni -> Load Barangays
  const handleCityChange = (e) => {
    const city = e.target.value;
    setFormData(prev => ({ 
        ...prev, city, barangay: '' 
    }));
    setBarangayOptions([]);

    if (city) {
        const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        fetch(`${apiBase}/api/barangays/${encodeURIComponent(city)}`)
            .then(res => res.json())
            .then(data => setBarangayOptions(data));
    }
  };

  // --- HELPER: Filter HEIs ---
  const filteredHeis = heiOptions.filter(hei => 
    hei.toLowerCase().includes(heiSearch.toLowerCase())
  );

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // --- COMPONENT: Label ---
  const Label = ({ text, required }) => (
    <label className="block text-xs font-bold text-gray-700 mb-1">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    try {
      const response = await fetch(`${apiBase}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          heiName: formData.heiName,
          campus: formData.campus,
          region: formData.region,
          province: formData.province,
          city: formData.city,
          barangay: formData.barangay,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          zipCode: formData.zipCode,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          suffix: formData.suffix
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      alert('Registration submitted for approval.');
    } catch (err) {
      console.error('Registration submit error:', err);
      alert(err.message || 'Failed to submit registration');
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-600">HEI Registration</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {/* --- HEI & CAMPUS SECTION --- */}
        <div className="grid grid-cols-2 gap-4">
          {/* Searchable HEI Dropdown */}
          <div className="relative">
            <Label text="HEI Name" required />
            <input 
              type="text"
              className="w-full p-2 border border-gray-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search HEI..."
              value={heiSearch}
              onChange={(e) => {
                setHeiSearch(e.target.value);
                setIsHeiOpen(true);
                setFormData(prev => ({ ...prev, heiName: '', campus: '' }));
              }}
              onFocus={() => setIsHeiOpen(true)}
              onBlur={() => setTimeout(() => setIsHeiOpen(false), 200)}
            />
            {isHeiOpen && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-xl max-h-60 overflow-y-auto">
                {filteredHeis.length > 0 ? (
                  filteredHeis.map((hei, idx) => (
                    <li key={idx} className="p-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0" onMouseDown={() => selectHei(hei)}>
                      {hei}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-sm text-gray-400 italic">No HEI found</li>
                )}
              </ul>
            )}
          </div>

          {/* Campus Dropdown */}
          <div>
            <Label text="Campus" required />
            <select 
                className="w-full p-2 border border-gray-300 rounded bg-white text-sm disabled:bg-gray-100"
                value={formData.campus}
                onChange={(e) => setFormData({...formData, campus: e.target.value})}
                disabled={!formData.heiName} 
            >
              <option value="">{formData.heiName ? "Select Campus" : "Select HEI first"}</option>
              {campusOptions.map((campus, idx) => (
                <option key={idx} value={campus}>{campus}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- ADDRESS SECTION --- */}
        <div>
            <h3 className="font-bold text-gray-700 text-sm mb-2">HEI Address</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
                {/* Region */}
                <div>
                    <Label text="Region" required />
                    <select 
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        value={formData.region}
                        onChange={handleRegionChange}
                    >
                        <option value="">Select Region</option>
                        {regionOptions.map((reg, idx) => (
                            <option key={idx} value={reg.designation}>
                                {reg.name} ({reg.designation})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Province */}
                <div>
                    <Label text="Province" required />
                    <select 
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm disabled:bg-gray-100"
                        value={formData.province}
                        onChange={handleProvinceChange}
                        disabled={!formData.region}
                    >
                        <option value="">Select Province</option>
                        {provinceOptions.map((prov, idx) => (
                            <option key={idx} value={prov.name}>{prov.name}</option>
                        ))}
                    </select>
                </div>

                {/* City/Municipality */}
                <div>
                    <Label text="City/Municipality" required />
                    <select 
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm disabled:bg-gray-100"
                        value={formData.city}
                        onChange={handleCityChange}
                        disabled={!formData.province}
                    >
                        <option value="">Select City/Municipality</option>
                        {cityOptions.map((city, idx) => (
                            <option key={idx} value={city.name}>{city.name}</option>
                        ))}
                    </select>
                </div>

                {/* Barangay */}
                <div>
                    <div className="flex items-center justify-between">
                        <Label text="Barangay" required />
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            setIsManualBarangay(prev => !prev);
                            setFormData(prev => ({ ...prev, barangay: '' }));
                          }}
                          disabled={!formData.city}
                        >
                          {isManualBarangay ? 'Use list' : 'Enter manually'}
                        </button>
                    </div>
                    {isManualBarangay ? (
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm disabled:bg-gray-100"
                        value={formData.barangay}
                        onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                        placeholder="Type barangay name"
                        disabled={!formData.city}
                      />
                    ) : (
                      <select 
                          className="w-full p-2 border border-gray-300 rounded bg-white text-sm disabled:bg-gray-100"
                          value={formData.barangay}
                          onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                          disabled={!formData.city}
                      >
                          <option value="">Select Barangay</option>
                          {barangayOptions.map((brgy, idx) => (
                              <option key={idx} value={brgy.name}>{brgy.name}</option>
                          ))}
                      </select>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <Label text="Address Line 1" required />
                  <input
                    type="text"
                    className="p-2 border border-gray-300 rounded text-sm w-full"
                    placeholder="Street, Building, etc."
                    value={formData.addressLine1}
                    onChange={handleFieldChange('addressLine1')}
                    required
                  />
                </div>
                <div>
                  <Label text="Address Line 2" />
                  <input
                    type="text"
                    className="p-2 border border-gray-300 rounded text-sm w-full"
                    placeholder="Unit, Floor, etc."
                    value={formData.addressLine2}
                    onChange={handleFieldChange('addressLine2')}
                  />
                </div>
            </div>
            
            <div>
                 <Label text="Zip Code" required />
                 <input
                  type="text"
                  className="p-2 border border-gray-300 rounded text-sm w-24"
                  placeholder="0000"
                  value={formData.zipCode}
                  onChange={handleFieldChange('zipCode')}
                  required
                 />
            </div>
        </div>

        {/* --- REPRESENTATIVE SECTION --- */}
        <div className="pt-2 border-t border-gray-100">
            <h3 className="font-bold text-gray-700 text-sm mb-2">Representative Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <Label text="First Name" required />
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={formData.firstName}
                      onChange={handleFieldChange('firstName')}
                      required
                    />
                </div>
                <div>
                    <Label text="Middle Name" />
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={formData.middleName}
                      onChange={handleFieldChange('middleName')}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label text="Last Name" required />
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={formData.lastName}
                      onChange={handleFieldChange('lastName')}
                      required
                    />
                </div>
                <div className="w-1/2"> 
                    <Label text="Suffix" />
                    <select
                      className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                      value={formData.suffix}
                      onChange={handleFieldChange('suffix')}
                    >
                      <option value="">N/A</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                    </select>
                </div>
            </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 mt-4 transition-colors">
          Submit Registration
        </button>

        <Link to="/login" className="block w-full text-center border border-blue-600 text-blue-600 py-2 rounded-md font-bold hover:bg-blue-50 mt-2 transition-colors">
          Back to Login
        </Link>
      </form>
    </AuthLayout>
  );
};

export default Register;
