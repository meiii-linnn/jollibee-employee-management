import React, { useEffect, useState } from 'react';
import { Download, PlayCircle, FileText, CheckCircle } from 'lucide-react';

const Payroll = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salRes, empRes] = await Promise.all([
        fetch(`/api/salary?month=${month}&year=${year}`),
        fetch('/api/employees')
      ]);
      const salData = await salRes.json();
      const empData = await empRes.json();
      
      setSalaries(salData.salaries || []);
      setEmployees(empData.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleCalculate = async () => {
    if (window.confirm('Bạn có muốn tính lương cho tất cả nhân viên đang hoạt động không?')) {
      setCalculating(true);
      try {
        const res = await fetch('/api/salary/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year })
        });
        const data = await res.json();
        alert(data.message || 'Tính lương hoàn tất');
        fetchData();
      } catch (err) {
        alert('Lỗi kết nối máy chủ');
      } finally {
        setCalculating(false);
      }
    }
  };

  const handleExport = () => {
    window.open(`/api/salary/export?month=${month}&year=${year}`, '_blank');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const totalPayroll = salaries.reduce((acc, curr) => acc + curr.net_salary, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Quản lý lương & Niềm vui.</h1>
          <div className="page-subtitle">
            Theo dõi hiệu suất và giải ngân lương cho {month}/{year}.
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '20px', fontWeight: '600', color: 'var(--text-main)' }}>
            <Download size={16} /> Xuất Excel
          </button>
          <button onClick={handleCalculate} disabled={calculating} style={{ background: 'var(--primary-red)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlayCircle size={18}/> {calculating ? 'Đang xử lý...' : 'Tính toàn bộ lương'}
          </button>
        </div>
      </div>

      <div className="card-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-red)' }}>
          <div className="stat-title">TỔNG QUỸ LƯƠNG</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="stat-value">{formatCurrency(totalPayroll)}</div>
          </div>
        </div>
        
        <div className="stat-card yellow-bg">
          <div className="stat-title">GIỜ TĂNG CA</div>
          <div className="stat-value" style={{ fontSize: '32px' }}>
            {salaries.reduce((acc, s) => acc + (s.overtime_pay > 0 ? 1 : 0), 0)} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>nhân viên</span>
          </div>
        </div>
        
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="stat-title">TRẠNG THÁI THANH TOÁN</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
             <CheckCircle color="var(--green)" size={24} />
             <span style={{ fontWeight: 'bold' }}>{salaries.length > 0 ? 'Đã xử lý 100%' : 'Đang chờ'}</span>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Bảng lương nhân viên</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr' }}>
          <div>NHÂN VIÊN</div>
          <div>SỐ NGÀY CÔNG</div>
          <div>LƯƠNG GROSS</div>
          <div>KHẤU TRỪ</div>
          <div>LƯƠNG THỰC NHẬN</div>
          <div>TRẠNG THÁI</div>
        </div>

        {loading ? (
          <div className="loading-spinner">Đang tải dữ liệu lương...</div>
        ) : salaries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không có dữ liệu lương cho kỳ này. Nhấn "Tính toàn bộ lương" để bắt đầu.
          </div>
        ) : (
          <div className="table-body">
            {salaries.map(sal => {
              const emp = employees.find(e => e.id === sal.employee_id);
              return (
                <div className="table-row" key={sal.id} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr' }}>
                  <div className="emp-info">
                    <div className="avatar">
                      <img src={`https://ui-avatars.com/api/?name=${emp?.full_name?.replace(' ', '+') || 'A'}&background=random`} alt="User" />
                    </div>
                    <div className="emp-details">
                      <span className="emp-name">{emp?.full_name || `Emp #${sal.employee_id}`}</span>
                      <span className="emp-id">{emp?.position || ''}</span>
                    </div>
                  </div>
                  
                  <div style={{ fontWeight: '500' }}>{sal.total_days_worked} ngày</div>
                  
                  <div style={{ color: 'var(--text-muted)' }}>{formatCurrency(sal.gross_salary)}</div>
                  
                  <div style={{ color: 'var(--primary-red)', fontWeight: '500' }}>
                    -{formatCurrency(sal.insurance_deduction + sal.tax_deduction)}
                  </div>
                  
                  <div style={{ fontWeight: '800', fontSize: '15px' }}>
                    {formatCurrency(sal.net_salary)}
                  </div>
                  
                  <div>
                    <span className="status-badge" style={{ backgroundColor: 'var(--light-yellow)', color: '#8B6510' }}>
                      {sal.status === 'Processed' ? 'Đã xử lý' : sal.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
