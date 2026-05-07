import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';

const Insurance = () => {
  const [insurances, setInsurances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInsurances = async () => {
    setLoading(true);
    try {
      const [res, empRes] = await Promise.all([
        fetch('/api/insurance'),
        fetch('/api/employees')
      ]);
      const data = await res.json();
      const empData = await empRes.json();
      setInsurances(data.insurances || []);
      setEmployees(empData.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Bảo hiểm nhân sự</h1>
          <div className="page-subtitle">Quản lý các khoản BHXH, BHYT, BHTN</div>
        </div>
        <button onClick={() => alert('Đang mở form đăng ký bảo hiểm...')} style={{ background: 'var(--primary-red)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18}/> Đăng ký bảo hiểm
        </button>
      </div>

      <div className="content-card">
        <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Danh sách bảo hiểm</h3>
        
        <div className="table-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr' }}>
          <div>NHÂN VIÊN</div>
          <div>SỐ SỔ BHXH</div>
          <div>LOẠI BẢO HIỂM</div>
          <div>MỨC ĐÓNG</div>
          <div>NGÀY ĐĂNG KÝ</div>
          <div>TRẠNG THÁI</div>
        </div>

        {loading ? (
          <div className="loading-spinner">Đang tải dữ liệu...</div>
        ) : insurances.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có hồ sơ bảo hiểm nào.</div>
        ) : (
          <div className="table-body">
            {insurances.map(ins => {
              const emp = employees.find(e => e.id === ins.employee_id);
              return (
              <div className="table-row" key={ins.id} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr' }}>
                <div style={{ fontWeight: '600' }}>{emp ? emp.full_name : `Nhân viên #${ins.employee_id}`}</div>
                <div>{ins.insurance_number || 'Chưa cập nhật'}</div>
                <div>{ins.insurance_type}</div>
                <div style={{ fontWeight: 'bold', color: 'var(--primary-red)' }}>
                  {formatCurrency(ins.contribution_amount || 0)}
                </div>
                <div>{ins.start_date}</div>
                <div>
                  <span className="status-badge" style={{ backgroundColor: 'var(--green)20', color: 'var(--green)' }}>
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {ins.status || 'Đang đóng'}
                  </span>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insurance;
