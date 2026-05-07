import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Bell, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tổng quan cửa hàng</h1>
        <div className="page-subtitle">
          <span>Trung tâm - Cửa hàng #001</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        {/* Main Performance Card */}
        <div style={{ flex: '2', background: 'var(--primary-red)', color: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', opacity: 0.9 }}>
              HIỆU SUẤT CỬA HÀNG HÔM NAY
            </div>
            <div style={{ fontSize: '56px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>
              24.850.000 ₫
            </div>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>
              +12.4% so với hôm qua
            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: '32px', right: '32px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>16 Nhân viên đang làm việc</div>
            </div>
          </div>
        </div>

        {/* Side Cards */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--yellow)', borderRadius: 'var(--radius-lg)', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <UserCheck size={32} color="#1A1A1A" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#1A1A1A', lineHeight: 1 }}>24</div>
            <div style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: '500', marginTop: '8px' }}>Đơn chờ duyệt</div>
          </div>
          
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', flex: 1, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
               <UsersIcon />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#1A1A1A', lineHeight: 1 }}>{stats?.employee_count || '142'}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '8px' }}>Tổng số nhân viên</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: '2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Hoạt động gần đây</h3>
            <a href="#" style={{ color: 'var(--primary-red)', fontWeight: '600', fontSize: '14px' }}>Xem tất cả báo cáo</a>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Activity Items */}
            {[
              { title: 'Đổi ca: Nhân viên Bếp', desc: 'Vũ Minh Tuấn đã thay thế Trần Thị Hoa', time: '14:20 PM', status: 'ĐÃ DUYỆT', color: 'var(--green)' },
              { title: 'Đã tính lương: Tháng 5/2026', desc: 'Giao dịch cho toàn bộ nhân viên', time: '11:05 AM', status: 'THÀNH CÔNG', color: 'var(--yellow)' },
              { title: 'Cảnh báo vắng mặt', desc: '2 nhân viên chưa chấm công vào làm', time: '08:00 AM', status: 'CẦN XỬ LÝ', color: 'var(--primary-red)' }
            ].map((act, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                   <Bell size={20} color={act.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{act.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{act.desc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{act.time}</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: act.color, backgroundColor: `${act.color}20`, padding: '4px 10px', borderRadius: '12px' }}>
                    {act.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Thao tác nhanh</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Chỉnh sửa lịch', icon: Calendar, action: () => navigate('/scheduling') },
                { label: 'Kiểm kho', icon: CheckCircle, action: () => alert('Tính năng Kiểm kho đang được cập nhật.') },
                { label: 'Gửi thông báo', icon: Bell, action: () => alert('Đã gửi thông báo đến toàn bộ nhân viên!') },
                { label: 'Báo cáo P&L', icon: CheckCircle, action: () => alert('Đang xuất báo cáo P&L...') }
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <div onClick={action.action} key={i} style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <Icon size={24} color="var(--primary-red)" />
                    <span style={{ fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>{action.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default Dashboard;
