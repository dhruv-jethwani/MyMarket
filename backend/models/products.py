from . import db
from mongoengine import StringField, DateTimeField, IntField, FloatField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, ListField
from datetime import datetime, timedelta, timezone

IST = timezone(timedelta(hours=5, minutes=30))
def get_ist_now():
    return datetime.now(IST)

class Specification(EmbeddedDocument):
    key = StringField(required=True)
    value = StringField(required=True)

class Product(db.Document):
    meta = {'collection': 'products'}
    name = StringField(required=True)
    description = StringField(required=True)
    seller = ReferenceField('User', required=True, reverse_delete_rule=db.CASCADE)
    cost_price = FloatField(required=True)
    price = FloatField(required=True)
    category = StringField(choices=['general', 'electronics', 'food'], default='general')
    stock_quantity = IntField(required=True)
    image_url = StringField(required=True)
    specifications = ListField(EmbeddedDocumentField(Specification))
    created_at = DateTimeField(default=get_ist_now)

# --- NEW: FINANCIAL LEDGER MODEL ---
class InventoryLog(db.Document):
    meta = {'collection': 'inventory_logs'}
    seller = ReferenceField('User', required=True, reverse_delete_rule=db.CASCADE)
    product = ReferenceField('Product', required=True, reverse_delete_rule=db.CASCADE)
    quantity_added = IntField(required=True)
    cost_price_per_unit = FloatField(required=True)
    total_expense = FloatField(required=True)
    timestamp = DateTimeField(default=get_ist_now)

# --- DATABASE QUERIES & LOGIC ---

def getallproducts():
    return Product.objects.all()

def add_product(name, description, seller, cost_price, price, category, stock_quantity, image_url, specifications):
    product = Product(
        name=name, 
        description=description, 
        seller=seller, 
        cost_price=float(cost_price),
        price=float(price), 
        category=category, 
        stock_quantity=int(stock_quantity), 
        image_url=image_url, 
        specifications=specifications
    )
    return product.save()

def get_product_by_seller_id(sellerid):
    return Product.objects(seller=sellerid) 

def get_product(product_id):
    return Product.objects.get(pk=product_id)

def delete_product(product_id):
    product = Product.objects(pk=product_id).first()
    if product:
        product.delete()
        return True
    return False

def update_product(product_id, update_data):
    product = Product.objects(pk=product_id).first()
    if product:
        product.update(**update_data)
        return True
    return False

# --- NEW: RESTOCK BUSINESS LOGIC ---
def restock_product(product_id, qty_to_add):
    product = Product.objects(pk=product_id).first()
    if not product:
        raise Exception("Product not found")

    qty = int(qty_to_add)
    expense = qty * product.cost_price

    # 1. Log the financial expense
    log = InventoryLog(
        seller=product.seller,
        product=product,
        quantity_added=qty,
        cost_price_per_unit=product.cost_price,
        total_expense=expense
    )
    log.save()

    # 2. Update actual product stock
    product.stock_quantity += qty
    product.save()

    return product

def get_seller_ledger(seller_id):
    return InventoryLog.objects(seller=seller_id).order_by('-timestamp')