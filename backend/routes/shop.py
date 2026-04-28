from . import shop_bp
from flask import request, jsonify
import json
import os
import cloudinary
import cloudinary.uploader

from models.products import add_product, getallproducts, get_product_by_seller_id, get_product, delete_product, update_product

# --- CLOUDINARY CONFIGURATION ---
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

import re

def extract_public_id(image_url):
    """Extracts the Cloudinary public_id from a standard secure_url."""
    if not image_url or "cloudinary" not in image_url:
        return None
    try:
        # Splits the URL at '/upload/' and takes the second half
        parts = image_url.split('/upload/')
        if len(parts) > 1:
            path = parts[1]
            # Removes the version number (e.g., v1712345678/)
            path = re.sub(r'^v\d+/', '', path)
            # Removes the file extension (e.g., .jpg)
            public_id = path.rsplit('.', 1)[0]
            return public_id
    except Exception as e:
        print(f"Error extracting public_id: {e}")
    return None

@shop_bp.route('/product', methods=['POST', 'GET'])
def product():
    if request.method == 'POST':
        try:
            # 1. EXTRACT TEXT DATA FROM FORM
            # Because we sent FormData from React, we MUST use request.form, not request.get_json()
            name = request.form.get("name")
            description = request.form.get("description")
            seller = request.form.get("seller")
            price = request.form.get("price")
            category = request.form.get("category")
            stock_quantity = request.form.get("stock_quantity")
            
            # 2. PARSE SPECIFICATIONS
            # React sent specs as a JSON string like: {"Brand": "Sony", "Color": "Black"}
            # We need to parse it back into the List format MongoEngine expects: [{"key": "Brand", "value": "Sony"}]
            raw_specs = request.form.get("specifications", "{}")
            specs_dict = json.loads(raw_specs)
            specifications = [{"key": k, "value": v} for k, v in specs_dict.items()]

            # 3. EXTRACT AND UPLOAD THE IMAGE
            image_file = request.files.get("image")
            
            if not image_file:
                return jsonify({"error": "No image file provided"}), 400

            # Upload the file stream directly to Cloudinary
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder="MyMarket/products" # Places it exactly in the folder you requested
            )
            
            # Extract the secure HTTPS link provided by Cloudinary
            image_url = upload_result.get("secure_url")

            # 4. SAVE TO DATABASE
            add_product(
                name=name, 
                description=description, 
                seller=seller, 
                price=price, 
                category=category, 
                stock_quantity=stock_quantity, 
                image_url=image_url, 
                specifications=specifications
            )
            
            return jsonify({
                "message": "Product added successfully", 
                "image_url": image_url
            }), 200

        except Exception as e:
            print(f"Error adding product: {e}")
            return jsonify({"error": str(e)}), 500

    elif request.method == 'GET': #this is for customer shop
        products = getallproducts()
        # Fixed the jsonify syntax here so it returns a proper JSON response
        return jsonify({"message": "Products retrieved successfully", "products": products}), 200
    
@shop_bp.route('/product/<product_id>', methods=['GET', 'DELETE', 'PATCH'])
def get__product(product_id):
    try:
        # ==========================================
        # 1. GET: FETCH PRODUCT DETAILS
        # ==========================================
        if request.method == 'GET':
            product = get_product(product_id)
            if product:
                return jsonify({"message": "Product retrieved", "product": product}), 200
            return jsonify({"error": "Product not found"}), 404
            
        # ==========================================
        # 2. DELETE: REMOVE PRODUCT + CLEANUP CLOUDINARY
        # ==========================================
        elif request.method == 'DELETE':
            from models.products import delete_product
            
            # Fetch the product FIRST to get its image URL
            product = get_product(product_id)
            if not product:
                return jsonify({"error": "Product not found"}), 404
                
            # Clean up Cloudinary
            if product.image_url:
                public_id = extract_public_id(product.image_url)
                if public_id:
                    cloudinary.uploader.destroy(public_id)
            
            # Remove from Database
            success = delete_product(product_id)
            if success:
                return jsonify({"message": "Product and image deleted successfully"}), 200
            return jsonify({"error": "Failed to delete product from database"}), 500
            
        # ==========================================
        # 3. PATCH: PARTIAL UPDATE & IMAGE SWAP
        # ==========================================
        elif request.method == 'PATCH':
            from models.products import update_product
            import json
            import cloudinary.uploader
            
            update_data = {}
            
            # Grab basic text fields
            text_fields = ["name", "description", "price", "category", "stock_quantity"]
            for field in text_fields:
                if request.form.get(field):
                    update_data[field] = request.form.get(field)
                    
            # Parse dynamic specifications
            if request.form.get("specifications"):
                raw_specs = request.form.get("specifications")
                specs_dict = json.loads(raw_specs)
                update_data["specifications"] = [{"key": k, "value": v} for k, v in specs_dict.items()]
                
            # Handle Cloudinary Image Swap Securely
            image_file = request.files.get("image")
            if image_file:
                # 1. Fetch current product to find the old image
                current_product = get_product(product_id)
                if current_product and current_product.image_url:
                    old_public_id = extract_public_id(current_product.image_url)
                    if old_public_id:
                        # DESTROY the old image
                        cloudinary.uploader.destroy(old_public_id)
                
                # 2. Upload the new image
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="MyMarket/products"
                )
                update_data["image_url"] = upload_result.get("secure_url")
                
            if not update_data:
                return jsonify({"message": "No data provided to update"}), 400
                
            # Push changes to database
            success = update_product(product_id, update_data)
            
            if success:
                return jsonify({"message": "Product updated successfully"}), 200
            return jsonify({"error": "Failed to update product in database"}), 400

    except Exception as e:
        print(f"CRITICAL ERROR in get__product: {e}")
        return jsonify({"error": str(e)}), 500
        
    return jsonify({"error": "Method Not Allowed"}), 405
        
    
@shop_bp.route('/seller', methods=['POST']) 
# Changed this to POST because GET requests shouldn't have a JSON body
def seller_products():
    data = request.get_json()
    seller_id = data.get("seller_id")
    products = get_product_by_seller_id(sellerid=seller_id)
    return jsonify({"message": "Products retrieved successfully", "products": products}), 200