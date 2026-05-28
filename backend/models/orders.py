from . import db
from mongoengine import StringField, FloatField, DateTimeField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, ListField, IntField
from datetime import datetime, timedelta, timezone
from models.products import Product # Required to deduct stock

IST = timezone(timedelta(hours=5, minutes=30))
def get_ist_now():
    return datetime.now(IST)

class OrderItem(EmbeddedDocument):
    product_id = StringField(required=True)
    seller_id = StringField(required=True) 
    name = StringField(required=True)
    price_at_purchase = FloatField(required=True)
    cost_price_at_purchase = FloatField(required=True, default=0.0) 
    quantity = IntField(required=True)

class Order(db.Document):
    meta = {'collection': 'orders'}
    user = ReferenceField('User', required=True, reverse_delete_rule=db.CASCADE)
    items = ListField(EmbeddedDocumentField(OrderItem), default=list)
    total_amount = FloatField(required=True)
    status = StringField(choices=['Pending', 'Paid', 'Shipped', 'Delivered'], default='Pending')
    gateway_ref = StringField()
    timestamp = DateTimeField(default=get_ist_now)

# --- BUSINESS LOGIC QUERIES ---

def process_checkout(user_id, raw_items, payment_status, gateway_ref):
    order_items = []
    total_amount = 0.0
    
    for item in raw_items:
        prod_data = item.get('product', {})
        p_id = prod_data.get('_id', {}).get('$oid') if isinstance(prod_data.get('_id'), dict) else prod_data.get('_id')
        qty = int(item.get('quantity', 1))
        
        product = Product.objects(pk=p_id).first()
        if not product: raise Exception(f"Product {p_id} no longer exists.")
            
        # 1. Deduct Stock Here
        if product.stock_quantity >= qty:
            product.stock_quantity -= qty
            product.save()
        else:
            raise Exception(f"Not enough stock for {product.name}.")
        
        seller_id_str = str(product.seller.id) if hasattr(product.seller, 'id') else str(product.seller)
        cost = getattr(product, 'cost_price', 0.0)
        
        order_item = OrderItem(
            product_id=str(product.id),
            seller_id=seller_id_str,
            name=product.name,
            price_at_purchase=product.price,
            cost_price_at_purchase=cost,
            quantity=qty
        )
        order_items.append(order_item)
        total_amount += (product.price * qty)
        
    order = Order(
        user=user_id,
        items=order_items,
        total_amount=total_amount,
        status=payment_status,
        gateway_ref=gateway_ref
    )
    return order.save()

def get_seller_orders(seller_id):
    return Order.objects(items__seller_id=seller_id).order_by('-timestamp')

def update_order_status(order_id, new_status):
    order = Order.objects(id=order_id).first()
    if order:
        order.status = new_status
        order.save()
        return True
    return False

def get_seller_analytics_data(seller_id):
    orders = Order.objects(items__seller_id=seller_id)
    total_revenue, total_profit, total_items_sold = 0, 0, 0
    monthly_sales = [0] * 12
    current_year = get_ist_now().year
    
    for order in orders:
        for item in order.items:
            if item.seller_id == seller_id:
                revenue = item.price_at_purchase * item.quantity
                cost = item.cost_price_at_purchase * item.quantity
                profit = revenue - cost
                
                total_revenue += revenue
                total_profit += profit
                total_items_sold += item.quantity
                
                if order.timestamp.year == current_year:
                    monthly_sales[order.timestamp.month - 1] += revenue
                    
    return {
        "total_revenue": total_revenue,
        "total_profit": total_profit,
        "total_items_sold": total_items_sold,
        "monthly_sales": monthly_sales
    }