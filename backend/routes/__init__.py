from flask import Blueprint

auth_bp = Blueprint("auth", __name__)
shop_bp = Blueprint("shop", __name__)
cart_bp = Blueprint("cart", __name__)

from . import auth, shop, cart