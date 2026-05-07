import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle, Calendar } from 'lucide-react';

const Contract = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const [res, empRes] = await Promise.all([
        fetch('/api/contracts'),
        fetch('/api/employees')
      ]);
      const data = await res.json();
      const empData = await empRes.json();
      setContracts(data.contracts || []);
      setEmployees(empData.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Hợp đồng nhân sự</h1>
          <div className="page-subtitle">Quản lý các hợp đồng lao động và phụ cấp</div>
        </div>
        <button onClick={() => alert('Đang mở form tạo hợp đồng mới...')} style={{ background: 'var(--primary-red)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18}/> Tạo hợp đồng mới
        </button>
      </div>

      <div className="content-card">
        <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Danh sách hợp đồng</h3>
        
        <div className="table-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr' }}>
          <div>NHÂN VIÊN</div>
          <div>LOẠI HỢP ĐỒNG</div>
          <div>BẮT ĐẦU</div>
          <div>KẾT THÚC</div>
          <div>LƯƠNG CƠ BẢN</div>
        </div>

        {loading ? (
          <div className="loading-spinner">Đang tải dữ liệu...</div>
        ) : contracts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có hợp đồng nào.</div>
        ) : (
          <div className="table-body">
            {contracts.map(contract => {
              const emp = employees.find(e => e.id === contract.employee_id);
              return (
              <div className="table-row" key={contract.id} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr' }}>
                <div style={{ fontWeight: '600' }}>{emp ? emp.full_name : `Nhân viên #${contract.employee_id}`}</div>
                <div>{contract.contract_type}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-muted)" /> {contract.start_date}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: !contract.end_date ? 'var(--text-muted)' : 'inherit' }}>
                  <Calendar size={14} color="var(--text-muted)" /> {contract.end_date || 'Vô thời hạn'}
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--green)' }}>
                  {formatCurrency(contract.basic_salary)}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contract;
