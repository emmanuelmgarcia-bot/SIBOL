import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Upload, 
  ChevronDown, 
  ChevronRight, 
  LogOut,
  User
} from 'lucide-react';

const HEILayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formsOpen, setFormsOpen] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const stored = localStorage.getItem('sibol_user');
    if (!stored) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'hei') {
        navigate('/login');
        return;
      }
      if (!parsed.hei_id) {
        localStorage.removeItem('sibol_token');
        localStorage.removeItem('sibol_user');
        navigate('/login');
        return;
      }
      const username = parsed.username || '';
      if (username) {
        setDisplayName(username);
      }
      const mustChange = !!parsed.must_change_password;
      setMustChangePassword(mustChange);
      if (mustChange && location.pathname !== '/hei/account') {
        navigate('/hei/account');
      }
    } catch (e) {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('sibol_token');
    localStorage.removeItem('sibol_user');
    navigate('/login');
  };

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
            <p className="text-xs text-blue-200 truncate">Welcome,</p>
            <h1 className="font-bold text-sm truncate">
              {displayName || 'HEI Admin'}
            </h1>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {!mustChangePassword && (
            <>
              <Link to="/hei/dashboard" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/hei/dashboard') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>

              {/* Forms Dropdown */}
              <button onClick={() => setFormsOpen(!formsOpen)} className="w-full flex items-center justify-between px-6 py-3 hover:bg-blue-800 text-left">
                <div className="flex items-center gap-3"><FileText size={18} /> Forms</div>
                {formsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              {formsOpen && (
                <div className="bg-blue-900/50 py-2">
                  <Link to="/hei/form1" className={`block pl-14 py-2 text-sm hover:text-chedGold ${isActive('/hei/form1') ? 'text-chedGold font-bold' : 'text-gray-300'}`}>Form 1</Link>
                  <Link to="/hei/form2" className={`block pl-14 py-2 text-sm hover:text-chedGold ${isActive('/hei/form2') ? 'text-chedGold font-bold' : 'text-gray-300'}`}>Form 2</Link>
                </div>
              )}

              <Link to="/hei/subjects" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/hei/subjects') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <BookOpen size={18} /> Subjects
              </Link>

              <Link to="/hei/programs" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/hei/programs') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <GraduationCap size={18} /> Programs
              </Link>

              <Link to="/hei/faculty" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/hei/faculty') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <Users size={18} /> Faculty
              </Link>

              <Link to="/hei/submissions" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/hei/submissions') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
                <Upload size={18} /> Submissions
              </Link>
            </>
          )}

          <Link to="/hei/account" className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-800 ${isActive('/hei/account') ? 'bg-blue-800 border-l-4 border-chedGold' : ''}`}>
            <User size={18} /> Account
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-300 hover:text-red-100 w-full px-4 py-2 text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">HEI Dashboard</h2>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
};

export default HEILayout;
