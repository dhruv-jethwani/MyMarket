from . import shop_bp
from flask import request, jsonify
import json
import os
import jwt
import cloudinary
import cloudinary.uploader
import re

from models.products import add_product, getallproducts, get_product_by_seller_id, get_product, delete_product, update_product, restock_product, get_seller_ledger


def serialize_product(product):
    if not product:
        return None

    return {
        "id": str(product.id),
        "_id": {"$oid": str(product.id)},
        "name": product.name,
        "description": product.description,
        "seller": str(product.seller.id) if product.seller else None,
        "cost_price": float(product.cost_price) if product.cost_price is not None else None,
        "price": float(product.price) if product.price is not None else None,
        "category": product.category,
        "stock_quantity": int(product.stock_quantity) if product.stock_quantity is not None else None,
        "image_url": product.image_url,
        "specifications": [{"key": s.key, "value": s.value} for s in product.specifications] if product.specifications else [],
        "created_at": product.created_at.isoformat() if getattr(product, 'created_at', None) else None
    }

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

def extract_public_id(image_url):
    if not image_url or "cloudinary" not in image_url: return None
    try:
        parts = image_url.split('/upload/')
        if len(parts) > 1:
            path = parts[1]
            path = re.sub(r'^v\d+/', '', path)
            public_id = path.rsplit('.', 1)[0]
            return public_id
    except Exception as e:
        print(f"Error extracting public_id: {e}")
    return None

@shop_bp.route('/product', methods=['POST', 'GET'])
def product():
    if request.method == 'POST':
        try:
            name = request.form.get("name")
            description = request.form.get("description")
            seller = request.form.get("seller")
            cost_price = request.form.get("cost_price")
            price = request.form.get("price")
            category = request.form.get("category")
            stock_quantity = request.form.get("stock_quantity")
            
            raw_specs = request.form.get("specifications", "{}")
            specs_dict = json.loads(raw_specs)
            specifications = [{"key": k, "value": v} for k, v in specs_dict.items()]

            image_file = request.files.get("image")
            if not image_file:
                return jsonify({"error": "No image file provided"}), 400

            upload_result = cloudinary.uploader.upload(image_file, folder="MyMarket/products")
            image_url = upload_result.get("secure_url")

            add_product(name, description, seller, cost_price, price, category, stock_quantity, image_url, specifications)
            return jsonify({"message": "Product added successfully", "image_url": image_url}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'GET':
        products = getallproducts()
        serialized = [serialize_product(p) for p in products]
        return jsonify({"message": "Products retrieved successfully", "products": serialized}), 200
    
@shop_bp.route('/product/<product_id>', methods=['GET', 'DELETE', 'PATCH'])
def get__product(product_id):
    try:
        if request.method == 'GET':
            product = get_product(product_id)
            if product: return jsonify({"message": "Product retrieved", "product": serialize_product(product)}), 200
            return jsonify({"error": "Product not found"}), 404
            
        elif request.method == 'DELETE':
            product = get_product(product_id)
            if not product: return jsonify({"error": "Product not found"}), 404
    
            if product.image_url:
                public_id = extract_public_id(product.image_url)
                if public_id: cloudinary.uploader.destroy(public_id)

            success = delete_product(product_id)
            if success: return jsonify({"message": "Product and image deleted successfully"}), 200
            return jsonify({"error": "Failed to delete product from database"}), 500
            
        elif request.method == 'PATCH':
            update_data = {}
            text_fields = ["name", "description", "cost_price", "price", "category", "stock_quantity"]
            for field in text_fields:
                if request.form.get(field): update_data[field] = request.form.get(field)
        
            if request.form.get("specifications"):
                raw_specs = request.form.get("specifications")
                specs_dict = json.loads(raw_specs)
                update_data["specifications"] = [{"key": k, "value": v} for k, v in specs_dict.items()]
    
            image_file = request.files.get("image")
            if image_file:
                current_product = get_product(product_id)
                if current_product and current_product.image_url:
                    old_public_id = extract_public_id(current_product.image_url)
                    if old_public_id: cloudinary.uploader.destroy(old_public_id)
                upload_result = cloudinary.uploader.upload(image_file, folder="MyMarket/products")
                update_data["image_url"] = upload_result.get("secure_url")
                
            if not update_data: return jsonify({"message": "No data provided to update"}), 400
                
            success = update_product(product_id, update_data)
            if success: return jsonify({"message": "Product updated successfully"}), 200
            return jsonify({"error": "Failed to update product in database"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Method Not Allowed"}), 405

@shop_bp.route('/seller', methods=['POST'])
def seller_products():
    data = request.get_json()
    seller_id = data.get("seller_id")
    products = get_product_by_seller_id(sellerid=seller_id)

    # This ensures raw DB objects transform into pure serializable JSON dictionaries
    serialized = [serialize_product(p) for p in products] 
    return jsonify({"message": "Products retrieved successfully", "products": serialized}), 200

# --- NEW: ADD STOCK ROUTE ---
@shop_bp.route('/product/<product_id>/restock', methods=['PATCH'])
def restock_route(product_id):
    try:
        data = request.get_json()
        qty = int(data.get('quantity', 0))
        if qty <= 0: return jsonify({"error": "Quantity must be greater than 0"}), 400

        restock_product(product_id, qty)
        return jsonify({"message": f"Successfully restocked {qty} units."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- NEW: FINANCIAL LEDGER ROUTE ---
@shop_bp.route('/seller/ledger', methods=['GET'])
def seller_ledger_route():
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        seller_id = decoded.get('user_id')

        logs = get_seller_ledger(seller_id)
        
        # Serialize for frontend
        log_data = []
        for log in logs:
            log_data.append({
                "id": str(log.id),
                "product_name": log.product.name if log.product else "Deleted Product",
                "quantity_added": log.quantity_added,
                "cost_price": log.cost_price_per_unit,
                "total_expense": log.total_expense,
                "timestamp": log.timestamp.isoformat()
            })
        return jsonify({"ledger": log_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500