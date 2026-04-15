from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from routes import auth_bp, shop_bp, cart_bp
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['MONGODB_SETTINGS'] = {
    'host': os.environ.get('MONGO_URI')
}
db.init_app(app)

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(shop_bp, url_prefix='/shop')
app.register_blueprint(cart_bp, url_prefix='/cart')

@app.route('/')
def home():
    return {
        "status": "online",
        "message": "Welcome to the MyMarket API",
        "version": "1.0.0"
    }, 200

if __name__ == "__main__":
	app.run(debug=True, host="0.0.0.0", port=5000)