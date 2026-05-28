from . import order_bp
from flask import request, jsonify
from models.orders import create_order, OrderItem, Order
from models.cart import clear_cart
import jwt
import os

@order_bp.route('/place_order', methods=['POST'])
def place_order():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        raw_items = data.get('items')
        payment_status = data.get('payment_status', 'Paid')
        gateway_ref = data.get('gateway_ref', '')

        if not user_id or not raw_items:
            return jsonify({"error": "Missing order data"}), 400

        order_items = []
        total_amount = 0.0

        for item in raw_items:
            product_data = item.get('product', {})
            name = product_data.get('name', 'Unknown')
            price = float(product_data.get('price', 0))
            qty = int(item.get('quantity', 1))

            order_items.append(OrderItem(
                name=name,
                price_at_purchase=price,
                quantity=qty
            ))
            total_amount += (price * qty)

        create_order(user_id, order_items, total_amount, payment_status, gateway_ref)

        clear_cart(user_id)

        return jsonify({"message": "Order placed successfully"}), 201

    except Exception as e:
        print(f"Error placing order: {e}")
        return jsonify({"error": str(e)}), 500

@order_bp.route('/history', methods=['GET'])
def get_order_history():
    try:
        # Securely grab the token from headers
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Missing or invalid authorization header"}), 401

        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        user_id = decoded_token.get('user_id')

        # Fetch orders sorted by newest first
        orders = Order.objects(user=user_id).order_by('-timestamp')

        # Manually format to JSON to resolve ObjectIds and Dates safely
        orders_data = []
        for order in orders:
            orders_data.append({
                "id": str(order.id),
                "total_amount": order.total_amount,
                "status": order.status,
                "gateway_ref": order.gateway_ref,
                "timestamp": order.timestamp.isoformat(),
                "items": [{"name": item.name, "price": item.price_at_purchase, "quantity": item.quantity} for item in order.items]
            })

        return jsonify({"message": "Orders retrieved", "orders": orders_data}), 200

    except Exception as e:
        print(f"Error fetching order history: {e}")
        return jsonify({"error": "Internal server error"}), 500