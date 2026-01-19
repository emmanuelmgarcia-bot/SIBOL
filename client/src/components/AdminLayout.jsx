import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Users,
  User,
  LogOut,
  Globe 
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('sibol_token');
    localStorage.removeItem('sibol_user');
    navigate('/login/admin');
  };

  useEffect(() => {
    const stored = localStorage.getItem('sibol_user');
    if (!stored) {
      navigate('/login/admin');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      const superFlag =
        parsed.username === 'superched' || parsed.role === 'superadmin';
      setIsSuperAdmin(!!superFlag);
      if (superFlag) {
        setDisplayName('superuser');
      } else if (parsed.assigned_region) {
        setDisplayName(`${parsed.assigned_region} Office`);
      } else {
        const fallback = parsed.username || parsed.email || '';
        if (fallback) {
          setDisplayName(fallback);
        }
      }
      const mustChange = !!parsed.must_change_password;
      setMustChangePassword(mustChange);
      if (mustChange && location.pathname !== '/admin/account') {
        navigate('/admin/account');
      }
    } catch (e) {
      navigate('/login/admin');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-chedBlue text-white flex flex-col shadow-xl z-20">
        
        {/* LOGO SECTION */}
        <div className="p-6 border-b border-blue-800 flex items-center gap-3">
          {/* White Circle Container */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 shrink-0">
             <img 
                src="/portal/assets/ched-logo.png" 
                alt="CHED Logo" 
                className="w-full h-full object-contain"
             />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-blue-200 truncate">Admin Portal</p>
            <h1 className="font-bold text-sm truncate">
              {displayName || 'CHED Admin'}
            </h1>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-4 overflow-y-auto">
          
          {!mustChangePassword && (
            <>
              <Link to="/admin/dashboard" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/admin/dashboard') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>

              <Link to="/admin/subjects" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/admin/subjects') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <BookOpen size={18} /> Subjects
              </Link>

              <Link to="/admin/programs" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/admin/programs') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <GraduationCap size={18} /> Programs
              </Link>

              <Link to="/admin/submissions" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/admin/submissions') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <FileText size={18} /> Submissions
              </Link>

              <Link to="/admin/registrations" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/admin/registrations') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <Users size={18} /> Registrations
              </Link>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    const envBase = import.meta.env.VITE_SIBOL_SITE_URL;
                    let baseUrl = envBase && typeof envBase === 'string' && envBase.trim()
                      ? envBase.trim()
                      : null;

                    if (!baseUrl) {
                      if (window.location.hostname === 'localhost') {
                        baseUrl = 'http://localhost:5174';
                      } else {
                        baseUrl = window.location.origin;
                      }
                    }

                    const normalizedBase = baseUrl.replace(/\/$/, '');
                    const url = `${normalizedBase}/admin`;
                    window.open(url, '_blank');
                  }}
                  className="w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-800 text-left"
                >
                  <Globe size={18} /> Edit Website
                </button>
              )}
            </>
          )}

          <Link to="/admin/account" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/admin/account') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
            <User size={18} /> Account
          </Link>

        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-blue-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-300 hover:text-red-100 w-full px-4 py-2 text-sm transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
