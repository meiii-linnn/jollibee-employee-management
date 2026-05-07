import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      setAttendances(data.attendances || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'var(--green)';
      case 'absent': return 'var(--primary-red)';
      case 'late': return 'var(--yellow)';
      case 'half-day': return '#8B6510';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'Có mặt';
      case 'absent': return 'Vắng mặt';
      case 'late': return 'Đi trễ';
      case 'half-day': return 'Nửa ngày';
      default: return status;
    }
  };

  const handleCheckIn = async () => {
    alert('Đã chấm công thành công!');
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Chấm công</h1>
          <div className="page-subtitle">Theo dõi giờ giấc làm việc của nhân viên</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCheckIn} style={{ background: 'var(--primary-red)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18}/> Chấm công ngay
          </button>
        </div>
      </div>

      <div className="content-card">
        <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Lịch sử chấm công</h3>
        
        <div className="table-header" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
          <div>NGÀY</div>
          <div>NHÂN VIÊN</div>
          <div>MÃ NV</div>
          <div>CHECK IN</div>
          <div>CHECK OUT</div>
          <div>TRẠNG THÁI</div>
        </div>

        {loading ? (
          <div className="loading-spinner">Đang tải dữ liệu...</div>
        ) : attendances.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có dữ liệu chấm công.</div>
        ) : (
          <div className="table-body">
            {attendances.map(att => (
              <div className="table-row" key={att.id} style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
                <div style={{ fontWeight: '600' }}>{att.date}</div>
                <div>{att.employee_name}</div>
                <div>{att.employee_code}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="var(--green)" /> {att.check_in || '--:--'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={14} color="var(--primary-red)" /> {att.check_out || '--:--'}
                </div>
                <div>
                  <span className="status-badge" style={{ backgroundColor: `${getStatusColor(att.status)}20`, color: getStatusColor(att.status) }}>
                    {getStatusLabel(att.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
