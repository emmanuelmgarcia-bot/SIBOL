import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const passwordIsValid = (value) => {
  if (!value || value.length < 8) return false;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  return hasUpper && hasLower && hasNumber;
};

const HEIAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    newUsername: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('sibol_user');
    if (!stored) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFormData(prev => ({
        ...prev,
        username: parsed.username || '',
        newUsername: parsed.username || ''
      }));
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert('Please fill in all required password fields.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    if (!passwordIsValid(formData.newPassword)) {
      alert('New password must be at least 8 characters and include uppercase, lowercase, and numeric characters.');
      return;
    }

    setLoading(true);

    try {
      const apiBase =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : '';

      const response = await fetch(`${apiBase}/api/auth/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          newUsername:
            formData.newUsername && formData.newUsername !== user.username
              ? formData.newUsername
              : null,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          isAdmin: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account');
      }

      if (data.user) {
        localStorage.setItem('sibol_user', JSON.stringify(data.user));
      }

      alert('Account updated successfully.');

      if (data.user && data.user.must_change_password) {
        navigate('/hei/account');
      } else {
        navigate('/hei/dashboard');
      }
    } catch (err) {
      alert(err.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const isFirstLogin = !!user.must_change_password;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-xl font-bold text-gray-800 mb-4">
        {isFirstLogin ? 'First Login: Update Account' : 'Account Settings'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Username
          </label>
          <input
            type="text"
            value={formData.username}
            disabled
            className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Username (optional)
          </label>
          <input
            type="text"
            name="newUsername"
            value={formData.newUsername}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
            placeholder="Re-enter new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2.5 rounded-md font-bold transition-colors ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default HEIAccount;
