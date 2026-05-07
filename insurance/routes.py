from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Insurance
from datetime import datetime

insurance_bp = Blueprint('insurance', __name__, url_prefix='/api/insurance')

def check_hr_admin():
    return current_user.role.name in ['Admin', 'HR']

def insurance_to_dict(insurance):
    return {
        'id': insurance.id,
        'employee_id': insurance.employee_id,
        'insurance_type': insurance.insurance_type,
        'insurance_number': insurance.insurance_number,
        'start_date': insurance.start_date.strftime('%Y-%m-%d') if insurance.start_date else None,
        'end_date': insurance.end_date.strftime('%Y-%m-%d') if insurance.end_date else None,
        'contribution_amount': insurance.contribution_amount,
        'status': insurance.status
    }

@insurance_bp.route('', methods=['GET'])
@login_required
def list_insurances():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    insurances = Insurance.query.all()
    return jsonify({'insurances': [insurance_to_dict(i) for i in insurances]}), 200

@insurance_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_insurance(id):
    insurance = Insurance.query.get_or_404(id)
    return jsonify(insurance_to_dict(insurance)), 200

@insurance_bp.route('', methods=['POST'])
@login_required
def add_insurance():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    try:
        insurance = Insurance(
            employee_id=data['employee_id'],
            insurance_type=data['insurance_type'],
            insurance_number=data.get('insurance_number'),
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
            contribution_amount=data.get('contribution_amount'),
            status='Active'
        )
        db.session.add(insurance)
        db.session.commit()
        return jsonify({'message': 'Insurance created', 'insurance': insurance_to_dict(insurance)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@insurance_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_insurance(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    insurance = Insurance.query.get_or_404(id)
    data = request.get_json()

    try:
        if data.get('end_date'):
            insurance.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if data.get('contribution_amount'):
            insurance.contribution_amount = data['contribution_amount']

        insurance.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Insurance updated', 'insurance': insurance_to_dict(insurance)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
