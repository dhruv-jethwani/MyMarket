from . import auth_bp
from flask import request, jsonify
from models.users import create_user, get_user_by_username, verify_password
from werkzeug.security import generate_password_hash
import jwt
import time
import dotenv
import os

@auth_bp.route('/register', methods=['POST'])
def register():
	data = request.get_json()
	fullname, username, email, password, role, address = data.get("fullname"), data.get("username"), data.get("email"), data.get("password"), data.get("role"), data.get("address")
	hashed_password = generate_password_hash(password)

	create_user(fullname, username, email, hashed_password, role, address)

	return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get("username"), data.get("password")
    
    # 1. Fetch the user (might be None if they don't exist)
    user = get_user_by_username(username)
    
    # 2. Verify the user exists AND the password matches FIRST
    if user and verify_password(user, password):
        
        # 3. Now it is safe to grab the ID and build the token
        payload = {
            'user_id': str(user.id), # Converted to string so PyJWT can encode it
            'role': user.role,       # Needed for your frontend role checks!
            "exp": int(time.time()) + 3600
        }
        token = jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')
        
        return jsonify({
            "message": "Login successful",
            "token": token
        }), 200
        
    # 4. If user is None or password is wrong, safely drop down here
    return jsonify({"error": "Invalid credentials"}), 401