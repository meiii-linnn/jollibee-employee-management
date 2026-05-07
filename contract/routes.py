from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Contract
from datetime import datetime

contract_bp = Blueprint('contract', __name__, url_prefix='/api/contracts')

def check_hr_admin():
    return current_user.role.name in ['Admin', 'HR']

def contract_to_dict(contract):
    return {
        'id': contract.id,
        'employee_id': contract.employee_id,
        'contract_type': contract.contract_type,
        'start_date': contract.start_date.strftime('%Y-%m-%d') if contract.start_date else None,
        'end_date': contract.end_date.strftime('%Y-%m-%d') if contract.end_date else None,
        'basic_salary': contract.basic_salary,
        'allowance': contract.allowance,
        'status': contract.status
    }

@contract_bp.route('', methods=['GET'])
@login_required
def list_contracts():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    contracts = Contract.query.all()
    return jsonify({'contracts': [contract_to_dict(c) for c in contracts]}), 200

@contract_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_contract(id):
    contract = Contract.query.get_or_404(id)
    return jsonify(contract_to_dict(contract)), 200

@contract_bp.route('', methods=['POST'])
@login_required
def add_contract():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    try:
        contract = Contract(
            employee_id=data['employee_id'],
            contract_type=data['contract_type'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
            basic_salary=data['basic_salary'],
            allowance=data.get('allowance', 0),
            status='Active'
        )
        db.session.add(contract)
        db.session.commit()
        return jsonify({'message': 'Contract created', 'contract': contract_to_dict(contract)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contract_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_contract(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    contract = Contract.query.get_or_404(id)
    data = request.get_json()

    try:
        if data.get('end_date'):
            contract.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if data.get('basic_salary'):
            contract.basic_salary = data['basic_salary']
        if data.get('allowance') is not None:
            contract.allowance = data['allowance']

        contract.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Contract updated', 'contract': contract_to_dict(contract)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contract_bp.route('/expiring', methods=['GET'])
@login_required
def expiring_contracts():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    from datetime import date, timedelta
    today = date.today()
    warning_date = today + timedelta(days=30)

    expiring = Contract.query.filter(
        Contract.status == 'Active',
        Contract.end_date <= warning_date,
        Contract.end_date >= today
    ).all()

    return jsonify({'expiring_contracts': [contract_to_dict(c) for c in expiring]}), 200
