from . import order_bp
from flask import request, jsonify
from models.orders import process_checkout, Order, get_seller_orders, update_order_status, get_all_global_orders, get_admin_analytics_stats, get_admin_dashboard_stats, get_seller_analytics_data
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

        process_checkout(user_id, raw_items, payment_status, gateway_ref)
        clear_cart(user_id)

        return jsonify({"message": "Order placed successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/history', methods=['GET'])
def get_order_history():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Missing or invalid authorization header"}), 401

        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        user_id = decoded_token.get('user_id')

        orders = Order.objects(user=user_id).order_by('-timestamp')
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
        return jsonify({"error": "Internal server error"}), 500

@order_bp.route('/seller_orders', methods=['GET'])
def seller_orders_route():
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        seller_id = decoded_token.get('user_id')
        
        orders = get_seller_orders(seller_id)
        orders_data = []
        for order in orders:
            seller_items = [{"name": i.name, "price": i.price_at_purchase, "quantity": i.quantity} for i in order.items if i.seller_id == seller_id]
            if seller_items:
                buyer_name = "Unknown Customer"
                if order.user:
                    buyer_name = getattr(order.user, 'fullname', getattr(order.user, 'username', 'Unknown Customer'))

                orders_data.append({
                    "id": str(order.id),
                    "timestamp": order.timestamp.isoformat(),
                    "status": order.status,
                    "buyer_name": buyer_name,
                    "items": seller_items,
                    "order_total": sum(i['price'] * i['quantity'] for i in seller_items)
                })
        return jsonify({"orders": orders_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/update_status/<order_id>', methods=['PATCH'])
def update_status_route(order_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        if not new_status:
            return jsonify({"error": "No status provided"}), 400

        success = update_order_status(order_id, new_status)
        if success:
            return jsonify({"message": "Status updated successfully"}), 200
        return jsonify({"error": "Failed to update status"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/seller_analytics', methods=['GET'])
def seller_analytics_route():
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        seller_id = decoded_token.get('user_id')
        
        analytics = get_seller_analytics_data(seller_id)
        return jsonify(analytics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ADMIN ROUTES (Deduplicated) ---

@order_bp.route('/admin/all', methods=['GET'])
def admin_get_all_orders():
    try:
        orders = get_all_global_orders()
        orders_data = []
        for order in orders:
            buyer_name = getattr(order.user, 'fullname', getattr(order.user, 'username', 'Unknown')) if order.user else 'Unknown'
            orders_data.append({
                "id": str(order.id),
                "timestamp": order.timestamp.isoformat(),
                "status": order.status,
                "buyer_name": buyer_name,
                "total_amount": order.total_amount,
                "gateway_ref": order.gateway_ref
            })
        return jsonify({"orders": orders_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/admin/dashboard', methods=['GET'])
def admin_dashboard_route():
    try:
        stats = get_admin_dashboard_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/admin/analytics', methods=['GET'])
def admin_analytics_route():
    try:
        stats = get_admin_analytics_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500