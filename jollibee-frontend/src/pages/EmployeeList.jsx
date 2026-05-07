import React, { useEffect, useState } from 'react';
import { MoreVertical, Filter, Plus, X, Trash2, Edit2 } from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_code: '', full_name: '', email: '', department: '', position: '', start_date: ''
  });

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(data.employees || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/employees/${editingId}` : '/api/employees';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData({ employee_code: '', full_name: '', email: '', department: '', position: '', start_date: '' });
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.error || 'Thao tác thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      employee_code: emp.employee_code || '',
      full_name: emp.full_name || '',
      email: emp.email || '',
      department: emp.department || '',
      position: emp.position || '',
      start_date: emp.start_date || ''
    });
    setEditingId(emp.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn đánh dấu nhân viên này đã nghỉ việc không?')) {
      try {
        const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        if (res.ok) fetchEmployees();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'active';
      case 'training': return 'training';
      case 'resigned':
      case 'on leave': return 'on-leave';
      default: return 'active';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Đang làm việc';
      case 'training': return 'Đang đào tạo';
      case 'resigned': return 'Đã nghỉ việc';
      case 'on leave': return 'Nghỉ phép';
      default: return status;
    }
  };

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const trainingCount = employees.filter(e => e.status === 'Training').length;
  const onLeaveCount = employees.filter(e => e.status !== 'Active' && e.status !== 'Training').length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Danh sách nhân sự</h1>
          <div className="page-subtitle">
            <span className="status-dot"></span>
            {activeCount} Nhân viên đang làm việc hôm nay
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => alert('Đang lọc theo vị trí...')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '20px', fontWeight: '600', color: 'var(--primary-red)' }}>
            <Filter size={16} /> Tất cả vị trí
          </button>
          <button onClick={() => alert('Đang lọc theo trạng thái...')} style={{ padding: '10px 16px', background: 'transparent', fontWeight: '500', color: 'var(--text-muted)' }}>Trạng thái</button>
          <button onClick={() => alert('Đang lọc theo ca làm...')} style={{ padding: '10px 16px', background: 'transparent', fontWeight: '500', color: 'var(--text-muted)' }}>Ca làm</button>
          <button onClick={() => alert('Mở bộ lọc nâng cao')} style={{ padding: '10px', background: 'var(--primary-red)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="card-grid">
        <div className="stat-card yellow-bg">
          <div className="stat-title">TỔNG NHÂN SỰ</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="stat-value">{employees.length}</div>
            <div className="stat-trend">+5 tháng này</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">ĐANG ĐÀO TẠO</div>
          <div className="stat-value">{trainingCount}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">NGHỈ PHÉP</div>
          <div className="stat-value">{onLeaveCount < 10 ? `0${onLeaveCount}` : onLeaveCount}</div>
        </div>
      </div>

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className="table-header" style={{ flex: 1, borderBottom: 'none', paddingBottom: 0 }}>
            <div>NHÂN VIÊN</div>
            <div>VỊ TRÍ</div>
            <div>LIÊN HỆ</div>
            <div>TRẠNG THÁI</div>
            <div>THAO TÁC</div>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: 'var(--primary-red)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16}/> Thêm nhân viên
          </button>
        </div>
        
        <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}></div>

        {loading ? (
          <div className="loading-spinner">Đang tải danh sách...</div>
        ) : (
          <div className="table-body">
            {employees.map(emp => (
              <div className="table-row" key={emp.id}>
                <div className="emp-info">
                  <div className="avatar">
                    <img src={`https://ui-avatars.com/api/?name=${emp.full_name.replace(' ', '+')}&background=random`} alt={emp.full_name} />
                  </div>
                  <div className="emp-details">
                    <span className="emp-name">{emp.full_name}</span>
                    <span className="emp-id">ID: #{emp.employee_code}</span>
                  </div>
                </div>
                
                <div className={`role-text ${emp.position === 'Quản lý cửa hàng' ? 'red' : ''}`}>
                  {emp.position || 'Nhân viên'}
                </div>
                
                <div className="contact-info">
                  <span className="email">{emp.full_name.split(' ')[0].toLowerCase()}@jollibee.com</span>
                  <span className="phone">{emp.phone || '+63 912 345 6789'}</span>
                </div>
                
                <div>
                  <span className={`status-badge ${getStatusColor(emp.status)}`}>
                    {getStatusLabel(emp.status)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEdit(emp)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>Sửa</button>
                  <Trash2 size={18} color="var(--primary-red)" cursor="pointer" onClick={() => handleDelete(emp.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pagination">
          <span>Hiển thị 1 đến {employees.length} trong tổng số {employees.length} nhân viên</span>
          <div className="page-numbers">
            <span>&lt;</span>
            <div className="page-btn active">1</div>
            <div className="page-btn">2</div>
            <div className="page-btn">3</div>
            <span>&gt;</span>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-lg)', width: '500px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>{editingId ? 'Cập nhật nhân viên' : 'Thêm nhân sự mới'}</h2>
              <X cursor="pointer" onClick={() => setShowModal(false)} />
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Mã nhân viên</label>
                <input required type="text" value={formData.employee_code} onChange={e => setFormData({...formData, employee_code: e.target.value})} placeholder="Vd: JB-1234" />
              </div>
              <div className="form-group">
                <label>Họ và tên</label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Nguyễn Văn A" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="nguyenvana@jollibee.com" />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Phòng ban</label>
                  <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Bếp" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Chức vụ</label>
                  <input required type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="Đầu bếp" />
                </div>
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              
              <button type="submit" style={{ background: 'var(--primary-red)', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', marginTop: '16px' }}>
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
