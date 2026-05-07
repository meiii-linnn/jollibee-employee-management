import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Wallet, UserPlus, Settings, LogOut, Bell, MessageSquare, HelpCircle, Search, Plus, Clock, FileText, Shield } from 'lucide-react';
import EmployeeList from './pages/EmployeeList';
import Dashboard from './pages/Dashboard';
import Scheduling from './pages/Scheduling';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import Contract from './pages/Contract';
import Insurance from './pages/Insurance';
import Login from './pages/Login';

// Jollibee Logo
const LOGO_URL = '/jollibee-logo.png';

const Sidebar = ({ onLogout, user }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    ...(user?.role === 'Admin' || user?.role === 'HR' ? [
      { path: '/employees', icon: Users, label: 'Nhân sự' }
    ] : []),
    { path: '/attendance', icon: Clock, label: 'Chấm công' },
    { path: '/scheduling', icon: CalendarDays, label: 'Xếp ca' },
    { path: '/payroll', icon: Wallet, label: 'Tính lương' },
    ...(user?.role === 'Admin' || user?.role === 'HR' ? [
      { path: '/contracts', icon: FileText, label: 'Hợp đồng' },
      { path: '/insurances', icon: Shield, label: 'Bảo hiểm' }
    ] : []),
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={LOGO_URL} alt="Jollibee Logo" />
        <span className="store-name">Cửa hàng #001 - Trung tâm</span>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {(user?.role === 'Admin' || user?.role === 'HR') && (
        <button onClick={() => alert('Đang mở form Thêm nhân viên...')} className="add-staff-btn">
          <Plus size={20} />
          <span>Thêm Nhân Viên</span>
        </button>
      )}

      <div className="bottom-links">
        <div className="nav-item" onClick={() => alert('Đang mở trang cài đặt...')} style={{ cursor: 'pointer' }}>
          <Settings size={20} />
          <span>Cài đặt</span>
        </div>
        <div className="nav-item" onClick={onLogout} style={{ cursor: 'pointer' }}>
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
};

const Topbar = ({ user }) => {
  return (
    <header className="topbar">
      <div className="search-bar">
        <Search size={18} />
        <input type="text" placeholder="Tìm kiếm nhân viên, ca làm..." />
      </div>

      <div className="topbar-actions">
        <Bell className="action-icon" size={20} onClick={() => alert('Chưa có thông báo mới.')} style={{ cursor: 'pointer' }} />
        <MessageSquare className="action-icon" size={20} onClick={() => alert('Chưa có tin nhắn mới.')} style={{ cursor: 'pointer' }} />
        <HelpCircle className="action-icon" size={20} onClick={() => alert('Trung tâm trợ giúp đang được cập nhật.')} style={{ cursor: 'pointer' }} />
        
        <div className="user-profile">
          <div className="user-info">
            <div className="user-name">{user?.username || 'Quản lý cửa hàng'}</div>
            <div className="user-role">{user?.role === 'Admin' ? 'Quản trị viên' : user?.role === 'HR' ? 'Nhân sự' : 'Nhân viên'}</div>
          </div>
          <div className="avatar">
            <img src="https://ui-avatars.com/api/?name=Admin&background=1A1A1A&color=fff" alt="User" />
          </div>
        </div>
      </div>
    </header>
  );
};

const AppLayout = ({ children, user, onLogout }) => {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} user={user} />
      <div className="main-content">
        <Topbar user={user} />
        <div className="page-container">
          {children}
        </div>
      </div>
      
      {/* Floating Plus Button (Optional based on design) */}
      <div className="floating-action" onClick={() => alert('Thao tác tạo mới nhanh...')} style={{ cursor: 'pointer' }}>
        <Plus size={24} />
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on load
    fetch('/api/profile')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner">Đang tải...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={user ? <AppLayout user={user} onLogout={handleLogout}><Dashboard /></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/employees" 
          element={user ? <AppLayout user={user} onLogout={handleLogout}><EmployeeList /></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/scheduling" 
          element={user ? <AppLayout user={user} onLogout={handleLogout}><Scheduling /></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/payroll" 
          element={user ? <AppLayout user={user} onLogout={handleLogout}><Payroll /></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/attendance" 
          element={user ? <AppLayout user={user} onLogout={handleLogout}><Attendance /></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/contracts" 
          element={user ? <AppLayout user={user} onLogout={handleLogout}><Contract /></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/insurances" 
          element={user ? <AppLayout user={user} onLogout={handleLogout}><Insurance /></AppLayout> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
