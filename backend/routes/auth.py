from . import auth_bp
from flask import request, jsonify
from models.users import create_user, get_user_by_username, verify_password
from werkzeug.security import generate_password_hash

@auth_bp.route('/register', methods=['POST'])
def register():
	data = request.get_json()
	username, email, password, role, address = data.get("username"), data.get("email"), data.get("password"), data.get("role"), data.get("address")
	hashed_password = generate_password_hash(password)

	create_user(username, email, hashed_password, role, address)

	return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
	data = request.get_json()
	username, password = data.get("username"), data.get("password")
	user = get_user_by_username(username)
	if user and verify_password(user, password):
		return jsonify({
            "message": "Login successful",
            "email": user.email # Added for React localStorage
        }), 200
	return jsonify({"error": "Invalid credentials"}), 401

