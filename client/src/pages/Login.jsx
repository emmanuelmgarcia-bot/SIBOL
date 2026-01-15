import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if we are on the Admin page based on URL
  const isAdmin = location.pathname.includes('admin');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for form inputs
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Sending login request...", formData);

      // CALL YOUR BACKEND API
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: formData.username, 
            password: formData.password,
            isAdmin // Pass this so backend knows which portal to enforce
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // LOGIN SUCCESS
      console.log("Login Successful:", data.user);

      // 1. Save Token & User to LocalStorage
      localStorage.setItem('sibol_token', data.token);
      localStorage.setItem('sibol_user', JSON.stringify(data.user));

      // 2. Redirect based on role
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/hei/dashboard');
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-6">
        <img src="/assets/ched-logo.png" alt="CHED Seal" className="w-16 h-16 mb-2" />
        <h2 className="text-xl font-medium text-gray-700">
          {isAdmin ? 'CHED Login' : 'HEI Login'}
        </h2>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input 
            type="text" 
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            placeholder={isAdmin ? "e.g. ched_region2" : "e.g. user@school.edu"}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              className="mr-2"
              checked={showPassword} 
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>
          <button type="button" className="text-gray-400 hover:text-gray-600">
            forgot password?
          </button>
        </div>

        <button 
            disabled={loading}
            className={`w-full text-white py-2.5 rounded-md font-bold transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {/* If HEI Login, show Register Button */}
        {!isAdmin && (
          <Link 
            to="/register"
            className={`block w-full text-center bg-green-600 text-white py-2.5 rounded-md font-bold hover:bg-green-700 transition-colors ${loading ? 'pointer-events-none opacity-50' : ''}`}
          >
            Register New Account
          </Link>
        )}

        {/* Toggle between Admin and HEI Login */}
        <Link 
          to={isAdmin ? "/login" : "/login/admin"}
          className={`block w-full text-center border border-blue-600 text-blue-600 py-2.5 rounded-md font-bold hover:bg-blue-50 transition-colors ${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {isAdmin ? "Switch to HEI Portal" : "Switch to Admin Portal"}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;