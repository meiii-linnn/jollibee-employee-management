from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from datetime import datetime
from models import db, User, Role, Employee
from employee.routes import employee_bp
from attendance.routes import attendance_bp
from contract.routes import contract_bp
from insurance.routes import insurance_bp
from salary.routes import salary_bp
from schedule.routes import schedule_bp
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///jollibee.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

app.register_blueprint(employee_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(contract_bp)
app.register_blueprint(insurance_bp)
app.register_blueprint(salary_bp)
app.register_blueprint(schedule_bp)

def init_db():
    with app.app_context():
        db.create_all()

        if not Role.query.first():
            roles = [
                Role(name='Admin', description='Full system access'),
                Role(name='HR', description='Human Resources management'),
                Role(name='Employee', description='Regular employee access')
            ]
            db.session.add_all(roles)

            admin_role = Role.query.filter_by(name='Admin').first()

            admin_user = User(
                username='admin',
                email='admin@jollibee.com',
                role_id=admin_role.id
            )
            admin_user.set_password('admin123')

            admin_employee = Employee(
                employee_code='ADMIN001',
                full_name='System Administrator',
                department='Management',
                position='Administrator',
                start_date=datetime.now().date(),
                status='Active'
            )
            db.session.add(admin_employee)
            db.session.flush()

            admin_user.employee_id = admin_employee.id
            db.session.add(admin_user)

            db.session.commit()
            print("Database initialized successfully!")

def seed_database():
    """Seed database with sample data for demo"""
    try:
        from seed import seed_data
        seed_data()
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Seeding database: {str(e)}")

def seed_data():
    """Import and run seed script"""
    import subprocess
    subprocess.run(['python', 'seed.py'], cwd=os.path.dirname(__file__))

@app.route('/')
def index():
    return jsonify({
        'message': 'Jollibee Employee Management API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/login',
            'employees': '/api/employees',
            'attendance': '/api/attendance',
            'contracts': '/api/contracts',
            'insurance': '/api/insurance',
            'salary': '/api/salary',
            'schedule': '/api/schedule'
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400

    user = User.query.filter_by(username=data['username']).first()

    if user and user.check_password(data['password']) and user.is_active:
        user.last_login = datetime.utcnow()
        db.session.commit()

        login_user(user)

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.name,
                'employee_id': user.employee_id
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/dashboard')
@login_required
def dashboard():
    employee_count = Employee.query.filter_by(status='Active').count()

    if current_user.role.name == 'Employee':
        employee = Employee.query.get(current_user.employee_id)
        return jsonify({
            'employee_count': employee_count,
            'employee': {
                'id': employee.id,
                'employee_code': employee.employee_code,
                'full_name': employee.full_name,
                'department': employee.department,
                'position': employee.position
            } if employee else None
        }), 200

    recent_employees = Employee.query.order_by(Employee.created_at.desc()).limit(5).all()

    return jsonify({
        'employee_count': employee_count,
        'recent_employees': [
            {
                'id': emp.id,
                'employee_code': emp.employee_code,
                'full_name': emp.full_name,
                'department': emp.department,
                'position': emp.position,
                'start_date': emp.start_date.strftime('%Y-%m-%d') if emp.start_date else None
            }
            for emp in recent_employees
        ]
    }), 200

@app.route('/api/profile')
@login_required
def profile():
    employee = Employee.query.get(current_user.employee_id)

    if not employee:
        return jsonify({'error': 'Employee profile not found'}), 404

    return jsonify({
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
        'status': employee.status,
        'user': {
            'username': current_user.username,
            'email': current_user.email,
            'role': current_user.role.name
        }
    }), 200

@app.errorhandler(404)
def not_found(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Endpoint not found'}), 404
    return send_from_directory(frontend_build, 'index.html')

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

from flask import send_from_directory

frontend_build = os.path.join(os.path.dirname(__file__), 'jollibee-frontend', 'dist')

if os.path.exists(frontend_build):
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path != "" and os.path.exists(os.path.join(frontend_build, path)):
            return send_from_directory(frontend_build, path)
        else:
            return send_from_directory(frontend_build, 'index.html')

    @app.route('/jollibee-logo.png')
    def serve_logo():
        return send_from_directory(os.path.dirname(__file__), 'jollibee-logo.png')

if __name__ == '__main__':
    if not os.path.exists('jollibee.db') and not os.environ.get('DATABASE_URL'):
        init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
