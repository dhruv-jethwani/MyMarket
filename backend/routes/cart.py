from . import cart_bp
from flask import request, jsonify
import json
from models.cart import get_create_cart, clear_cart

@cart_bp.route('/add_cart', methods = ['POST'])
def add_to_cart():
	try:
		data = request.get_json()
		user, raw_items = data.get("user"), data.get("items")
		
		items_dict = json.loads(raw_items)
		items = [{"product": k, "quantity": v} for k, v in items_dict.items()]

		get_create_cart(user=user, items=items)
		return jsonify({"message": "Added to Cart Successfully"}), 200
	
	except Exception as e:
            print(f"Error adding to cart: {e}")
            return jsonify({"error": str(e)}), 500

@cart_bp.route('/clear_cart', methods = ['POST'])
def clear_cart():
	try:
		data = request.get_json()
		user = data.get("user")
		clear_cart(user)
		return jsonify({"message": "Cart cleared Successfully"}), 200
	
	except Exception as e:
		print(f"Error clearing cart: {e}")
		return jsonify({"error": str(e)}), 500
	
@cart_bp.route('/get_cart/<user_id>')
def get_cart(user_id):
	try:
		cart = get_create_cart(user_id)
		if cart:
			return jsonify({"message": "Cart retrieved", "cart": cart}), 200
		return jsonify({"message": "Cart is Empty"}), 200
	
	except Exception as e:
		print(f"Error fetching cart: {e}")
		return jsonify({"error": str(e)}), 500