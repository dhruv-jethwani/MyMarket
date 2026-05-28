from . import cart_bp
from flask import request, jsonify
import json
from models.cart import get_create_cart, clear_cart as db_clear_cart, delete_cart_item # Rename the import to avoid collision
from models.cart import CartItem
import jwt
import os

@cart_bp.route('/add_cart', methods = ['POST'])
def add_to_cart():
	try:
		data = request.get_json()
		user, raw_items = data.get("user"), data.get("items")
        
		cart = get_create_cart(user_id=user)
        
		if isinstance(raw_items, str):
			items_dict = json.loads(raw_items)
		else:
			items_dict = raw_items
            
		new_items = [CartItem(product=k, quantity=v) for k, v in items_dict.items()]
		cart.items = new_items
		cart.save()
        
		return jsonify({"message": "Added to Cart Successfully"}), 200
        
	except Exception as e:
		print(f"Error adding to cart: {e}")
		return jsonify({"error": str(e)}), 500

@cart_bp.route('/clear_cart', methods = ['POST'])
def clear_cart_route():
	try:
		data = request.get_json()
		user = data.get("user")
		db_clear_cart(user)
		return jsonify({"message": "Cart cleared Successfully"}), 200
	
	except Exception as e:
		print(f"Error clearing cart: {e}")
		return jsonify({"error": str(e)}), 500
	
@cart_bp.route('/get_cart', methods=['GET'])
def get_cart():
    try:
        # 1. Securely grab the token from the headers
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Missing or invalid authorization header"}), 401

        token = auth_header.split(" ")[1]
        
        # 2. Decode the token on the server (hackers can't forge this without your SECRET_KEY)
        # Ensure you use your actual app secret key here
        decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        user_id = decoded_token.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Invalid token payload"}), 401

        cart = get_create_cart(user_id)
        
        cart_data = {
            "_id": {"$oid": str(cart.id)},
            "updated_at": cart.updated_at.isoformat(),
            "items": []
        }
        
        for item in cart.items:
            # Accessing item.product automatically triggers MongoEngine to fetch the full product document
            if item.product: 
                cart_data["items"].append({
                    "quantity": item.quantity,
                    "product": {
                        "_id": {"$oid": str(item.product.id)},
                        "name": item.product.name,
                        "price": item.product.price,
                        "image_url": getattr(item.product, 'image_url', '') # Safe fallback
                    }
                })
        
        return jsonify({
            "message": "Cart retrieved", 
            "cart": cart_data
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        print(f"Error fetching cart: {e}")
        return jsonify({"error": "Internal server error"}), 500
	
@cart_bp.route('/delete_item', methods=['DELETE'])
def delete_cartitem_route():
	try:
		data = request.get_json()
		user_id = data.get('user_id')
		product_id = data.get('product_id')
		
		if not user_id or not product_id:
			return jsonify({"error": "Missing required data"}), 400
		
		delete_cart_item(user_id, product_id)
		return jsonify({"message": "Item deleted successfully"}), 200
	except Exception as e:
		print(f"Error deleting cart item: {e}")
		return jsonify({"error": str(e)}), 500
