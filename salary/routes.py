from flask import Blueprint, request, jsonify, send_file
from flask_login import login_required, current_user
from models import db, Salary, Attendance, Contract, Employee
from datetime import datetime
from sqlalchemy import extract
from openpyxl import Workbook
import io

salary_bp = Blueprint('salary', __name__, url_prefix='/api/salary')

def check_hr_admin():
    return current_user.role.name in ['Admin', 'HR']

def salary_to_dict(salary):
    return {
        'id': salary.id,
        'employee_id': salary.employee_id,
        'month': salary.month,
        'year': salary.year,
        'basic_salary': salary.basic_salary,
        'allowance': salary.allowance,
        'bonus': salary.bonus,
        'overtime_pay': salary.overtime_pay,
        'total_days_worked': salary.total_days_worked,
        'gross_salary': salary.gross_salary,
        'insurance_deduction': salary.insurance_deduction,
        'tax_deduction': salary.tax_deduction,
        'net_salary': salary.net_salary,
        'status': salary.status
    }

@salary_bp.route('', methods=['GET'])
@login_required
def list_salaries():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    month = request.args.get('month', datetime.now().month, type=int)
    year = request.args.get('year', datetime.now().year, type=int)

    salaries = Salary.query.filter_by(month=month, year=year).all()
    return jsonify({'salaries': [salary_to_dict(s) for s in salaries]}), 200

@salary_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_salary(id):
    salary = Salary.query.get_or_404(id)
    return jsonify(salary_to_dict(salary)), 200

@salary_bp.route('/calculate', methods=['POST'])
@login_required
def calculate_salary():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    month = data.get('month', datetime.now().month)
    year = data.get('year', datetime.now().year)

    try:
        employees = Employee.query.filter_by(status='Active').all()

        created_count = 0
        for employee in employees:
            existing = Salary.query.filter_by(
                employee_id=employee.id,
                month=month,
                year=year
            ).first()

            if existing:
                continue

            contract = Contract.query.filter_by(
                employee_id=employee.id,
                status='Active'
            ).first()

            if not contract:
                continue

            attendances = Attendance.query.filter(
                Attendance.employee_id == employee.id,
                extract('month', Attendance.date) == month,
                extract('year', Attendance.date) == year
            ).all()

            total_hours = sum(a.total_hours or 0 for a in attendances)
            total_days = len([a for a in attendances if a.status == 'Present'])

            basic = contract.basic_salary
            allowance = contract.allowance or 0
            overtime = 0
            if total_hours > 160:
                overtime = total_hours - 160
                rate = basic / 160
                overtime = overtime * rate * 1.5

            gross = basic + allowance + overtime

            insurance = gross * 0.105
            tax = max(0, (gross - 5000000) * 0.05) if gross > 5000000 else 0

            net = gross - insurance - tax

            salary = Salary(
                employee_id=employee.id,
                month=month,
                year=year,
                basic_salary=basic,
                allowance=allowance,
                overtime_pay=overtime,
                total_days_worked=total_days,
                gross_salary=gross,
                insurance_deduction=insurance,
                tax_deduction=tax,
                net_salary=net,
                status='Draft'
            )

            db.session.add(salary)
            created_count += 1

        db.session.commit()
        return jsonify({'message': f'Calculated for {created_count} employees'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@salary_bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_salary(id):
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    salary = Salary.query.get_or_404(id)
    data = request.get_json()

    try:
        if data.get('bonus'):
            salary.bonus = data['bonus']
        if data.get('overtime_pay'):
            salary.overtime_pay = data['overtime_pay']
        if data.get('insurance_deduction') is not None:
            salary.insurance_deduction = data['insurance_deduction']
        if data.get('tax_deduction') is not None:
            salary.tax_deduction = data['tax_deduction']

        salary.gross_salary = salary.basic_salary + salary.allowance + salary.bonus + salary.overtime_pay
        salary.net_salary = salary.gross_salary - salary.insurance_deduction - salary.tax_deduction
        salary.updated_at = datetime.utcnow()

        db.session.commit()
        return jsonify({'message': 'Salary updated', 'salary': salary_to_dict(salary)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@salary_bp.route('/export', methods=['GET'])
@login_required
def export_salary():
    if not check_hr_admin():
        return jsonify({'error': 'Access denied'}), 403

    month = request.args.get('month', datetime.now().month, type=int)
    year = request.args.get('year', datetime.now().year, type=int)

    salaries = Salary.query.filter_by(month=month, year=year).all()

    wb = Workbook()
    ws = wb.active
    ws.title = f"Salary_{month}_{year}"

    # Headers
    headers = ['Employee Code', 'Full Name', 'Month', 'Year', 'Basic Salary', 
               'Allowance', 'Bonus', 'Overtime Pay', 'Total Days Worked', 
               'Gross Salary', 'Insurance Deduction', 'Tax Deduction', 'Net Salary', 'Status']
    ws.append(headers)

    for salary in salaries:
        employee = Employee.query.get(salary.employee_id)
        emp_code = employee.employee_code if employee else 'N/A'
        emp_name = employee.full_name if employee else 'N/A'
        
        ws.append([
            emp_code,
            emp_name,
            salary.month,
            salary.year,
            salary.basic_salary,
            salary.allowance,
            salary.bonus,
            salary.overtime_pay,
            salary.total_days_worked,
            salary.gross_salary,
            salary.insurance_deduction,
            salary.tax_deduction,
            salary.net_salary,
            salary.status
        ])

    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)

    filename = f"Salary_Report_{month}_{year}.xlsx"
    
    return send_file(
        excel_file,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=filename
    )
