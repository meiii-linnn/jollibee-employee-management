import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertTriangle, UserCheck, Plus, X } from 'lucide-react';

const Scheduling = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '', date: '', shift: 'Morning', start_time: '06:00', end_time: '14:00'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, empRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/employees')
      ]);
      const schedData = await schedRes.json();
      const empData = await empRes.json();
      
      setSchedules(schedData.schedules || []);
      setEmployees(empData.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
        setFormData({ employee_id: '', date: '', shift: 'Morning', start_time: '06:00', end_time: '14:00' });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add schedule');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <CalendarIcon color="var(--primary-red)" />
             Xếp ca
          </h1>
          <div className="page-subtitle">
            Quản lý ca và lịch làm việc của nhân viên
          </div>
        </div>
        
        <button onClick={() => setShowModal(true)} style={{ background: 'var(--primary-red)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18}/> Phân ca
        </button>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-title">TỶ LỆ LẤP ĐẦY</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="stat-value" style={{ color: 'var(--primary-red)' }}>94%</div>
            <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>+2% so với tuần trước</div>
          </div>
        </div>
        
        <div className="stat-card red-bg">
          <div className="stat-title" style={{ color: 'white' }}>CA TRỐNG</div>
          <div className="stat-value">06</div>
          <div className="stat-trend" style={{ color: 'white', fontStyle: 'italic' }}>Cần xử lý</div>
        </div>
        
        <div className="stat-card solid-yellow-bg">
          <div className="stat-title" style={{ color: 'black' }}>TRÙNG LỊCH</div>
          <div className="stat-value">02</div>
          <div className="stat-trend" style={{ color: 'black' }}>Nhân viên bị xếp trùng</div>
        </div>
      </div>

      <div className="content-card">
        <h3 style={{ marginBottom: '20px' }}>Ca làm sắp tới</h3>
        {loading ? (
          <div className="loading-spinner">Đang tải lịch làm việc...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {schedules.map(sched => {
              const emp = employees.find(e => e.id === sched.employee_id);
              return (
                <div key={sched.id} style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{sched.date}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--primary-red)', fontWeight: 'bold', background: 'var(--light-red)', padding: '4px 8px', borderRadius: '4px' }}>
                        {sched.shift === 'Morning' ? 'Sáng' : sched.shift === 'Afternoon' ? 'Chiều' : 'Tối'}
                      </div>
                      <X cursor="pointer" color="var(--text-muted)" size={16} onClick={() => alert('Đang xóa ca làm...')} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    {sched.start_time} - {sched.end_time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
                    <UserCheck size={14} color="var(--green)" />
                    {emp ? emp.full_name : `Nhân viên #${sched.employee_id}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-lg)', width: '500px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Phân ca</h2>
              <X cursor="pointer" onClick={() => setShowModal(false)} />
            </div>
            
            <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Nhân viên</label>
                <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <option value="">Chọn nhân viên</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Loại ca</label>
                <select required value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <option value="Morning">Sáng</option>
                  <option value="Afternoon">Chiều</option>
                  <option value="Evening">Tối</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Giờ bắt đầu</label>
                  <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Giờ kết thúc</label>
                  <input required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
              
              <button type="submit" style={{ background: 'var(--primary-red)', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', marginTop: '16px' }}>
                Lưu lịch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
