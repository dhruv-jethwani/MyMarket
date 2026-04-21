from . import shop_bp
from flask import request, jsonify
from models.products import add_product, getallproducts, get_product_by_seller_id, get_product

@shop_bp.route('/product', methods=['POST', 'GET'])
def product():
	if request.method == 'POST':
		data = request.get_json()
		name, description, seller, price, category, stock_quantity, image_url, specifications = data.get("name"), data.get("description"), data.get("seller"), data.get("price"), data.get("category"), data.get("stock_quantity"), data.get("image_url"), data.get("specifications")

		add_product(name, description, seller, price, category, stock_quantity, image_url, specifications)
		return jsonify({"message": "Product added successfully"}), 200

	elif request.method == 'GET':
		products = getallproducts()
		return jsonify(products, {"message":"Products retrieved successfully."}), 200
	
@shop_bp.route('/product/<product_id>', methods=['GET'])
def get__product(product_id):
	product = get_product(product_id)
	return jsonify(product, {"message":"Product retrieved successfully."}), 200
	
@shop_bp.route('/seller', methods=['GET'])
def seller_products():
	data = request.get_json()
	seller_id = data.get("seller_id")
	products = get_product_by_seller_id(sellerid=seller_id)
	return jsonify(products, {"message": "Products retrieved successfully"}), 200

