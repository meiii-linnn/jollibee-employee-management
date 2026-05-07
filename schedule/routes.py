from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Schedule, Employee, User
from datetime import datetime

schedule_bp = Blueprint('schedule', __name__, url_prefix='/api/schedules')

def check_hr_admin():
    return current_user.role.name in ['Admin', 'HR']

def send_schedule_notification(employee_id, action, schedule_date, shift):
    employee = Employee.query.get(employee_id)
    if not employee or not employee.user:
        return
    
    user_email = employee.user[0].email if isinstance(employee.user, list) else employee.user.email
    
    print(f"\n{'='*50}")
    print(f"📧 [EMAIL NOTIFICATION SENT]")
    print(f"To: {user_email} ({employee.full_name})")
    print(f"Subject: Thông báo cập nhật lịch làm việc")
    print(f"Body: Xin chào {employee.full_name},")
    print(f"Lịch làm việc của bạn vào ngày {schedule_date.strftime('%d/%m/%Y')} (Ca: {shift}) đã được {action}.")
    print(f"Vui lòng đăng nhập hệ thống để xem chi tiết.")
    print(f"{'='*50}\n")

def schedule_to_dict(schedule):
    return {
        'id': schedule.id,
        'employee_id': schedule.employee_id,
        'date': schedule.date.strftime('%Y-%m-%d') if schedule.date else None,
        'shift': schedule.shift,
        'start_time': schedule.start_time.strftime('%H:%M') if schedule.start_time else None,
        'end_time': schedule.end_time.strftime('%H:%M') if schedule.end_time else None,
        'position': schedule.position,
        'notes': schedule.notes,
        'status': schedule.status
    }

@schedule_bp.route('', methods=['GET'])
@login_required
def list_schedules():
    schedules = Schedule.query.all()
    return jsonify({'schedules': [schedule_to_dict(s) for s in schedules]}), 200

@schedule_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_schedule(id):
    schedule = Schedule.query.get_or_404(id)
    return jsonify(schedule_to_dict(schedule)), 200

@schedule_bp.route('', methods=['POST'])
@login_required
def add_schedule():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    try:
        schedule = Schedule(
            employee_id=data['employee_id'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            shift=data['shift'],
            start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
            end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
            position=data.get('position'),
            notes=data.get('notes'),
            status='Scheduled'
        )
        db.session.add(schedule)
        db.session.commit()
        
        # Gửi thông báo khi tạo lịch mới
        send_schedule_notification(schedule.employee_id, "PHÂN CÔNG MỚI", schedule.date, schedule.shift)
        
        return jsonify({'message': 'Schedule created', 'schedule': schedule_to_dict(schedule)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@schedule_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_schedule(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    schedule = Schedule.query.get_or_404(id)
    data = request.get_json()

    try:
        if data.get('shift'):
            schedule.shift = data['shift']
        if data.get('start_time'):
            schedule.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        if data.get('end_time'):
            schedule.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        if data.get('position'):
            schedule.position = data['position']
        if data.get('notes'):
            schedule.notes = data['notes']

        schedule.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Gửi thông báo khi cập nhật lịch
        send_schedule_notification(schedule.employee_id, "CẬP NHẬT", schedule.date, schedule.shift)
        
        return jsonify({'message': 'Schedule updated', 'schedule': schedule_to_dict(schedule)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@schedule_bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_schedule(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    schedule = Schedule.query.get_or_404(id)
    try:
        schedule.status = 'Cancelled'
        db.session.commit()
        
        # Gửi thông báo khi hủy lịch
        send_schedule_notification(schedule.employee_id, "HỦY BỎ", schedule.date, schedule.shift)
        
        return jsonify({'message': 'Schedule cancelled'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
