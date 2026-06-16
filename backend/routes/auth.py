from . import auth_bp
from flask import request, jsonify
from models.users import User, Address, create_user, get_user_by_username, verify_password, get_all_users, update_user_role, delete_user
from werkzeug.security import generate_password_hash
import jwt
import time
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

    user = get_user_by_username(username)
    
    if user and verify_password(user, password):

        payload = {
            'user_id': str(user.id),
            'role': user.role,
            'fullname': user.fullname,
            "exp": int(time.time()) + 3600
        }
        token = jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')
        
        return jsonify({
            "message": "Login successful",
            "token": token
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({"error": "User profile not found"}), 404
    
        user_data = {
            "fullname": user.fullname,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "address": {
                "street": user.address.street if user.address else "",
                "city": user.address.city if user.address else "",
                "zip_code": user.address.zip_code if user.address else ""
            }
        }
        return jsonify({"message": "Profile retrieved successfully", "user": user_data}), 200
        
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route('/update_profile/<user_id>', methods=['PUT'])
def update_user_profile(user_id):
    try:
        data = request.get_json()
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
    
        if data.get("fullname"):
            user.fullname = data.get("fullname")
        if data.get("email"):
            user.email = data.get("email")
    
        incoming_address = data.get("address", {})

        if not user.address:
            user.address = Address()
            
        user.address.street = incoming_address.get("street", user.address.street)
        user.address.city = incoming_address.get("city", user.address.city)
        
        if incoming_address.get("zip_code") is not None:
            user.address.zip_code = int(incoming_address.get("zip_code"))
   
        user.save()
        payload = {
            'user_id': str(user.id),
            'role': user.role,
            'fullname': user.fullname,
            "exp": int(time.time()) + 3600
        }
        token = jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')
        
        return jsonify({"message": "Profile updated successfully", "token": token}), 200
        
    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/admin/users', methods=['GET'])
def admin_get_users():
    try:
        users = get_all_users()
        user_list = [{"id": str(u.id), "fullname": u.fullname, "username": u.username, "email": u.email, "role": u.role} for u in users]
        return jsonify({"users": user_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/admin/users/<user_id>', methods=['PATCH', 'DELETE'])
def admin_manage_user(user_id):
    try:
        if request.method == 'PATCH':
            new_role = request.json.get('role')
            if update_user_role(user_id, new_role):
                return jsonify({"message": "Role updated successfully"}), 200
            return jsonify({"error": "User not found"}), 404
            
        elif request.method == 'DELETE':
            if delete_user(user_id):
                return jsonify({"message": "User deleted successfully"}), 200
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@auth_bp.route('/admin/users', methods=['GET'])
def admin_get_users():
    try:
        users = get_all_users()
        user_list = [{"id": str(u.id), "fullname": u.fullname, "username": u.username, "email": u.email, "role": u.role, "joined": u.id.generation_time.isoformat()} for u in users]
        return jsonify({"users": user_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/admin/users/<target_id>', methods=['PATCH', 'DELETE'])
def admin_manage_user(target_id):
    try:
        # Decode token to get current requester ID
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        requester_id = decoded.get('user_id')

        if request.method == 'PATCH':
            new_role = request.json.get('role')
            # Security Block: Prevent Self-Demotion
            if str(target_id) == str(requester_id):
                return jsonify({"error": "Action Denied: You cannot demote your own administrator account."}), 403
                
            if update_user_role(target_id, new_role):
                return jsonify({"message": "Role updated successfully"}), 200
            return jsonify({"error": "User not found"}), 404
            
        elif request.method == 'DELETE':
            # Security Block: Prevent Self-Deletion
            if str(target_id) == str(requester_id):
                return jsonify({"error": "Action Denied: You cannot delete your own active session."}), 403
                
            if delete_user(target_id):
                return jsonify({"message": "User deleted successfully"}), 200
            return jsonify({"error": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500