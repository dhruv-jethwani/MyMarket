import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# 1. LOAD ENVIRONMENT VARIABLES FIRST!
load_dotenv()

# 2. IMPORT NATIVE MONGOENGINE
import mongoengine as db
from routes import auth_bp, shop_bp, cart_bp, order_bp

app = Flask(__name__)

# Ensure Serverless CORS handles the cross-origin pre-flights properly
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# CRITICAL SERVERLESS FIX: Connect natively using mongoengine 
# instead of the outdated flask-mongoengine wrapper
db.connect(
    host=os.environ.get('MONGO_URI'),
    connect=False,       # Delays connection until first query (Crucial for Serverless cold starts)
    maxPoolSize=1,       # Prevents Vercel from exhausting your MongoDB connections
    serverSelectionTimeoutMS=5000
)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(shop_bp, url_prefix='/shop')
app.register_blueprint(cart_bp, url_prefix='/cart')
app.register_blueprint(order_bp, url_prefix='/order')

@app.route('/')
def home():
    return {
        "status": "online",
        "message": "Welcome to the MyMarket API",
        "version": "1.0.0",
        "environment": "Serverless"
    }, 200

# Vercel bypasses this block completely.
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)