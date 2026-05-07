from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Attendance, Employee
from datetime import datetime, date
from sqlalchemy import extract

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

def check_hr_admin():
    return current_user.role.name in ['Admin', 'HR']

def attendance_to_dict(att):
    return {
        'id': att.id,
        'employee_id': att.employee_id,
        'employee_name': att.employee.full_name if att.employee else None,
        'employee_code': att.employee.employee_code if att.employee else None,
        'date': att.date.strftime('%Y-%m-%d') if att.date else None,
        'check_in': att.check_in.strftime('%H:%M') if att.check_in else None,
        'check_out': att.check_out.strftime('%H:%M') if att.check_out else None,
        'total_hours': att.total_hours,
        'status': att.status,
        'notes': att.notes
    }

@attendance_bp.route('', methods=['GET'])
@login_required
def list_attendance():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)

    query = Attendance.query

    if not check_hr_admin():
        query = query.filter_by(employee_id=current_user.employee_id)
    elif search:
        query = query.join(Employee).filter(
            db.or_(
                Employee.full_name.ilike(f'%{search}%'),
                Employee.employee_code.ilike(f'%{search}%')
            )
        )

    if month and year:
        query = query.filter(
            extract('month', Attendance.date) == month,
            extract('year', Attendance.date) == year
        )

    attendances = query.order_by(Attendance.date.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'attendances': [attendance_to_dict(att) for att in attendances.items],
        'total': attendances.total,
        'pages': attendances.pages,
        'current_page': attendances.page
    }), 200

@attendance_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_attendance(id):
    att = Attendance.query.get_or_404(id)

    if not check_hr_admin() and att.employee_id != current_user.employee_id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify(attendance_to_dict(att)), 200

@attendance_bp.route('', methods=['POST'])
@login_required
def add_attendance():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied. HR or Admin only.'}), 403

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['employee_code', 'date', 'check_in', 'status']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        employee = Employee.query.filter_by(employee_code=data['employee_code']).first()
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404

        check_in_time = datetime.strptime(data['check_in'], '%H:%M').time()
        check_out_time = None
        total_hours = 0

        if data.get('check_out'):
            check_out_time = datetime.strptime(data['check_out'], '%H:%M').time()
            total_hours = (datetime.combine(date.today(), check_out_time) -
                         datetime.combine(date.today(), check_in_time)).total_seconds() / 3600

        attendance = Attendance(
            employee_id=employee.id,
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            check_in=check_in_time,
            check_out=check_out_time,
            total_hours=round(total_hours, 2),
            status=data['status'],
            notes=data.get('notes')
        )

        db.session.add(attendance)
        db.session.commit()

        return jsonify({
            'message': 'Attendance recorded successfully',
            'attendance': attendance_to_dict(attendance)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error adding attendance: {str(e)}'}), 500

@attendance_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_attendance(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied. HR or Admin only.'}), 403

    att = Attendance.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if data.get('employee_code'):
            employee = Employee.query.filter_by(employee_code=data['employee_code']).first()
            if employee:
                att.employee_id = employee.id

        if data.get('date'):
            att.date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        if data.get('check_in'):
            att.check_in = datetime.strptime(data['check_in'], '%H:%M').time()

        if data.get('check_out'):
            att.check_out = datetime.strptime(data['check_out'], '%H:%M').time()
            if att.check_in:
                total_hours = (datetime.combine(date.today(), att.check_out) -
                             datetime.combine(date.today(), att.check_in)).total_seconds() / 3600
                att.total_hours = round(total_hours, 2)

        if data.get('status'):
            att.status = data['status']

        if data.get('notes'):
            att.notes = data['notes']

        att.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Attendance updated successfully',
            'attendance': attendance_to_dict(att)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error updating attendance: {str(e)}'}), 500

@attendance_bp.route('/summary', methods=['GET'])
@login_required
def summary():
    month = request.args.get('month', datetime.now().month, type=int)
    year = request.args.get('year', datetime.now().year, type=int)

    if not check_hr_admin():
        attendances = Attendance.query.filter(
            Attendance.employee_id == current_user.employee_id,
            extract('month', Attendance.date) == month,
            extract('year', Attendance.date) == year
        ).all()

        total_hours = sum(a.total_hours or 0 for a in attendances)

        return jsonify({
            'month': month,
            'year': year,
            'attendances': [attendance_to_dict(a) for a in attendances],
            'total_hours': total_hours
        }), 200

    from sqlalchemy import func
    summary_data = db.session.query(
        Employee,
        func.sum(Attendance.total_hours).label('total_hours'),
        func.count(Attendance.id).label('days_worked')
    ).join(Attendance).filter(
        extract('month', Attendance.date) == month,
        extract('year', Attendance.date) == year
    ).group_by(Employee.id).all()

    return jsonify({
        'month': month,
        'year': year,
        'summary': [
            {
                'employee_id': emp.id,
                'employee_code': emp.employee_code,
                'full_name': emp.full_name,
                'total_hours': float(total_hours or 0),
                'days_worked': days_worked
            }
            for emp, total_hours, days_worked in summary_data
        ]
    }), 200

@attendance_bp.route('/my-attendance', methods=['GET'])
@login_required
def my_attendance():
    attendances = Attendance.query.filter_by(employee_id=current_user.employee_id)\
                    .order_by(Attendance.date.desc()).limit(30).all()

    return jsonify({
        'attendances': [attendance_to_dict(a) for a in attendances]
    }), 200
