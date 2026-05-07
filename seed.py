from app import app, db
from models import Employee, Contract, Schedule, Salary, Attendance, User, Role, Insurance
from datetime import datetime, date, time
import random

with app.app_context():
    # Clear old data
    db.session.query(Attendance).delete()
    db.session.query(Schedule).delete()
    db.session.query(Salary).delete()
    db.session.query(Contract).delete()
    db.session.query(User).delete()
    db.session.query(Employee).delete()
    db.session.query(Insurance).delete()
    db.session.commit()

    # Ensure roles exist
    hr_role = Role.query.filter_by(name='HR').first()
    if not hr_role:
        hr_role = Role(name='HR', description='Nhân sự')
        db.session.add(hr_role)
    
    emp_role = Role.query.filter_by(name='Employee').first()
    if not emp_role:
        emp_role = Role(name='Employee', description='Nhân viên')
        db.session.add(emp_role)
    
    db.session.commit()

    # Seed Employees
    employees_data = [
        {"code": "JB-1002", "name": "Nguyễn Văn Nam", "dept": "Quản lý", "pos": "Quản lý cửa hàng"},
        {"code": "JB-1045", "name": "Trần Thị Hoa", "dept": "Phục vụ", "pos": "Thu ngân"},
        {"code": "JB-1089", "name": "Lê Hoàng Hải", "dept": "Bếp", "pos": "Nhân viên Bếp"},
        {"code": "JB-1102", "name": "Phạm Đức Anh", "dept": "Phục vụ", "pos": "Phục vụ"},
        {"code": "JB-1105", "name": "Vũ Minh Tuấn", "dept": "Giao hàng", "pos": "Giao hàng"},
    ]

    for data in employees_data:
        emp = Employee.query.filter_by(employee_code=data['code']).first()
        if not emp:
            emp = Employee(
                employee_code=data['code'],
                full_name=data['name'],
                department=data['dept'],
                position=data['pos'],
                start_date=date(2026, 1, 15),
                status='Active' if data['code'] != 'JB-1102' else 'On Leave'
            )
            if data['code'] == 'JB-1045':
                emp.status = 'Training'
            db.session.add(emp)
            db.session.flush()

            # Add User account
            user = User(
                username='admin' if data['code'] == 'JB-1002' else data['code'],
                email=f"{data['name'].split()[-1].lower()}@jollibee.com",
                role_id=hr_role.id if data['code'] == 'JB-1002' else emp_role.id,
                employee_id=emp.id
            )
            user.set_password('admin123' if data['code'] == 'JB-1002' else 'password123')
            db.session.add(user)

            contract = Contract(
                employee_id=emp.id,
                contract_type='Full-time',
                start_date=date(2026, 1, 15),
                basic_salary=25000000 if data['pos'] == 'Quản lý cửa hàng' else 15000000
            )
            db.session.add(contract)

            # Add Schedule
            for d in range(23, 28):
                schedule = Schedule(
                    employee_id=emp.id,
                    date=date(2026, 5, d),
                    shift='Morning' if random.choice([True, False]) else 'Afternoon',
                    start_time=time(6, 0) if d % 2 == 0 else time(11, 0),
                    end_time=time(14, 0) if d % 2 == 0 else time(19, 0),
                    status='Scheduled'
                )
                db.session.add(schedule)

            # Add Attendance
            for d in range(1, 20):
                attendance = Attendance(
                    employee_id=emp.id,
                    date=date(2026, 5, d),
                    check_in=time(6, 0),
                    check_out=time(14, 0),
                    total_hours=8,
                    status='Present'
                )
                db.session.add(attendance)

            # Add Insurance
            for ins_type, amount in [('BHXH', 800000), ('BHYT', 200000), ('BHTN', 150000)]:
                insurance = Insurance(
                    employee_id=emp.id,
                    insurance_type=ins_type,
                    insurance_number=f"IN{data['code'].split('-')[1]}{ins_type}",
                    start_date=date(2026, 1, 15),
                    contribution_amount=amount,
                    status='Active'
                )
                db.session.add(insurance)

    db.session.commit()
    print("Database seeded successfully with Vietnamese dummy data!")
