# Jollibee Employee Management - BACKEND API

## 🔥 **CHỈ CÓ BACKEND - KHÔNG CÓ FRONTEND!**

## 📁 **CẤU TRÚC BACKEND:**

```
jollibee-employee-management/
├── app.py                # Flask API chính
├── models.py             # Database models (8 tables)
├── requirements.txt      # Python dependencies
├── employee/             # Employee API routes
├── attendance/           # Attendance API routes
├── instance/             # SQLite database
└── __pycache__/          # Python cache
```

## 🚀 **CHẠY BACKEND:**

```bash
cd C:\Users\LENOVO\Documents\koban\jollibee-employee-management
python app.py
```

**API Server:** http://127.0.0.1:5000

## 🌐 **API ENDPOINTS:**

### **✅ ĐANG HOẠT ĐỘNG:**

#### **Authentication**
```
POST /api/auth/login
→ {"username": "admin", "password": "admin123"}
← {"message": "Login successful", "user": {...}}
```

#### **Employee Management**
```
GET    /api/employees        → List employees (cần login)
GET    /api/employees/<id>   → Get employee detail
POST   /api/employees        → Add employee
PUT    /api/employees/<id>   → Update employee
DELETE /api/employees/<id>   → Delete employee
```

#### **Attendance Management**
```
GET    /api/attendance        → List attendance (cần login)
POST   /api/attendance        → Add attendance
PUT    /api/attendance/<id>   → Update attendance
GET    /api/attendance/summary → Attendance summary
```

### **❌ CHƯA LÀM:**
- Contract API
- Insurance API
- Salary API
- Schedule API

(Bạn cần không? Nếu cần thì làm thêm!)

## 📊 **DATABASE:**

**8 Tables:**
1. **users** - User accounts
2. **roles** - User roles (Admin, HR, Employee)
3. **employees** - Employee information
4. **attendances** - Attendance records
5. **contracts** - Employment contracts
6. **insurances** - Insurance information
7. **salaries** - Monthly salary
8. **schedules** - Work schedules

**File:** `instance/jollibee.db` (SQLite)

## 🧪 **TEST API:**

### **1. Login:**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@jollibee.com",
    "role": "Admin",
    "employee_id": 1
  }
}
```

### **2. Get Employees (cần session cookie):**
```bash
# Sau khi login, dùng cookie để gọi API tiếp
curl http://127.0.0.1:5000/api/employees \
  --cookie "session=..."
```

### **3. Add Employee:**
```bash
curl -X POST http://127.0.0.1:5000/api/employees \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "employee_code": "JOLL001",
    "full_name": "Nguyen Van A",
    "email": "nguyenva@jollibee.com",
    "department": "Kitchen",
    "position": "Chef",
    "start_date": "2026-04-29"
  }'
```

## 💡 **DÙNG POSTMAN:**

1. **Import Collection** (nếu có)
2. **Login API** → Lấy session cookie
3. **Dùng session cookie** cho các API khác
4. **Test CRUD operations**

## ⚠️ **LƯU Ý:**

- **401 Unauthorized** = Cần login trước
- **Session Cookie** = Lưu sau khi login
- **Database** = Tự động tạo khi chạy đầu tiên
- **Default Login** = admin / admin123

## 📚 **TÀI LIỆU:**

- **Flask**: Python web framework
- **Flask-Login**: Session management
- **SQLAlchemy**: Database ORM
- **SQLite**: Embedded database

---

**✅ CHỈ CÓ BACKEND PYTHON/FLASK - TRẢ VỀ JSON API!**
