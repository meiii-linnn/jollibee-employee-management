import React, { useState } from 'react';

const LOGO_URL = '/jollibee-logo.png';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={LOGO_URL} alt="Jollibee" className="login-logo" />
        <h2 style={{ marginBottom: '24px' }}>Cổng nhân viên</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="Vd: admin"
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <div className="error-msg">{error}</div>}
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-color)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>Tài khoản dùng thử:</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><b>Quản trị viên (HR/Admin)</b></span>
              <span>admin / admin123</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><b>Nhân viên (Thu ngân)</b></span>
              <span>JB-1045 / password123</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><b>Nhân viên (Phục vụ)</b></span>
              <span>JB-1102 / password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
