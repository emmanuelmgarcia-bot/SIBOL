import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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
      // console.log("Sending login request...", formData);

      const apiBase =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : '';

      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: formData.username, 
            password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // console.log("Login Successful:", data.user);

      localStorage.setItem('sibol_token', data.token);
      localStorage.setItem('sibol_user', JSON.stringify(data.user));

      const mustChange = !!(data.user && (data.user.must_change_password || data.user.is_first_login));
      const userRole = data.user.role || 'hei'; // Default to hei if not specified

      if (mustChange) {
        if (userRole === 'admin' || userRole === 'superadmin') {
          navigate('/admin/account');
        } else {
          navigate('/hei/account');
        }
      } else if (userRole === 'admin' || userRole === 'superadmin') {
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

  const handleForgotPassword = async () => {
    if (!formData.username) {
      alert('Please enter your username first.');
      return;
    }

    const confirmed = window.confirm(
      `Reset password for "${formData.username}" to the default (CHED@1994)?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const apiBase =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : '';

      const response = await fetch(`${apiBase}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      alert(data.message);
    } catch (error) {
      console.error('Forgot Password Error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In">
      <div className="mb-6 flex flex-col items-center">
        <img 
          src="/portal/assets/ched-logo.png" 
          alt="CHED Logo" 
          className="h-20 w-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          SIBOL Portal Login
        </h2>
        {/* <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access the system
        </p> */}
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <div className="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="username"
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out`}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </div>

        <div className="mt-4">
          <Link 
            to="/register" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            Register New Account
          </Link>
        </div>
      </form>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.</p>
      </div>
    </AuthLayout>
  );
};

export default Login;
