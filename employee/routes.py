from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Employee, User, Role
from datetime import datetime

employee_bp = Blueprint('employee', __name__, url_prefix='/api/employees')

def check_hr_admin():
    return current_user.role.name in ['Admin', 'HR']

def employee_to_dict(employee):
    return {
        'id': employee.id,
        'employee_code': employee.employee_code,
        'full_name': employee.full_name,
        'date_of_birth': employee.date_of_birth.strftime('%Y-%m-%d') if employee.date_of_birth else None,
        'gender': employee.gender,
        'phone': employee.phone,
        'address': employee.address,
        'department': employee.department,
        'position': employee.position,
        'start_date': employee.start_date.strftime('%Y-%m-%d') if employee.start_date else None,
        'end_date': employee.end_date.strftime('%Y-%m-%d') if employee.end_date else None,
        'status': employee.status,
        'created_at': employee.created_at.strftime('%Y-%m-%d %H:%M:%S') if employee.created_at else None
    }

@employee_bp.route('', methods=['GET'])
@login_required
def list_employees():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied. HR or Admin only.'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')

    query = Employee.query
    if search:
        query = query.filter(
            db.or_(
                Employee.full_name.ilike(f'%{search}%'),
                Employee.employee_code.ilike(f'%{search}%'),
                Employee.department.ilike(f'%{search}%')
            )
        )

    employees = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'employees': [employee_to_dict(emp) for emp in employees.items],
        'total': employees.total,
        'pages': employees.pages,
        'current_page': employees.page
    }), 200

@employee_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_employee(id):
    employee = Employee.query.get_or_404(id)

    if current_user.role.name == 'Employee' and current_user.employee_id != id:
        return jsonify({'error': 'Access denied. You can only view your own profile.'}), 403

    return jsonify(employee_to_dict(employee)), 200

@employee_bp.route('', methods=['POST'])
@login_required
def add_employee():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied. HR or Admin only.'}), 403

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['employee_code', 'full_name', 'email', 'department', 'position', 'start_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        employee = Employee(
            employee_code=data['employee_code'],
            full_name=data['full_name'],
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date() if data.get('date_of_birth') else None,
            gender=data.get('gender'),
            phone=data.get('phone'),
            address=data.get('address'),
            department=data['department'],
            position=data['position'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            status='Active'
        )

        db.session.add(employee)
        db.session.flush()

        hr_role = Role.query.filter_by(name='Employee').first()

        user = User(
            username=data['employee_code'],
            email=data['email'],
            role_id=hr_role.id,
            employee_id=employee.id
        )
        user.set_password('password123')

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'message': 'Employee added successfully',
            'employee': employee_to_dict(employee),
            'default_password': 'password123'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error adding employee: {str(e)}'}), 500

@employee_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_employee(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied. HR or Admin only.'}), 403

    employee = Employee.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'employee_code' in data:
            employee.employee_code = data['employee_code']
        if 'full_name' in data:
            employee.full_name = data['full_name']
        if 'date_of_birth' in data:
            employee.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        if 'gender' in data:
            employee.gender = data['gender']
        if 'phone' in data:
            employee.phone = data['phone']
        if 'address' in data:
            employee.address = data['address']
        if 'department' in data:
            employee.department = data['department']
        if 'position' in data:
            employee.position = data['position']
        if 'start_date' in data:
            employee.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()

        employee.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Employee updated successfully',
            'employee': employee_to_dict(employee)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error updating employee: {str(e)}'}), 500

@employee_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_employee(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied. HR or Admin only.'}), 403

    employee = Employee.query.get_or_404(id)

    try:
        employee.status = 'Resigned'
        employee.end_date = datetime.now().date()

        if employee.user:
            employee.user.is_active = False

        db.session.commit()

        return jsonify({
            'message': f'Employee {employee.full_name} has been marked as resigned'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error deleting employee: {str(e)}'}), 500
