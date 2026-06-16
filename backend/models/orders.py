from . import db
from mongoengine import StringField, FloatField, DateTimeField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, ListField, IntField
from datetime import datetime, timedelta, timezone
from models.products import Product 

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
    """Generates continuous date-wise data tracking Revenue, Expenses, Profit, and Margins."""
    orders = Order.objects(items__seller_id=seller_id).order_by('timestamp') 
    
    total_revenue, total_cost, total_profit, total_items_sold = 0, 0, 0, 0
    
    valid_orders = [o for o in orders if any(item.seller_id == seller_id for item in o.items)]
            
    if not valid_orders:
        return {
            "total_revenue": 0, "total_expenses": 0, "total_profit": 0, 
            "total_items_sold": 0, "overall_margin": 0, "chart_data": []
        }

    first_date = valid_orders[0].timestamp.date()
    last_date = valid_orders[-1].timestamp.date()
    
    # Timeline generation (capped at 365 days for performance)
    num_days = (last_date - first_date).days + 1
    if num_days > 365:
        first_date = last_date - timedelta(days=364)
        num_days = 365
        
    # Generate continuous date dictionary with our 3 main pillars
    date_range = [first_date + timedelta(days=x) for x in range(num_days)]
    daily_metrics = {d.strftime('%b %d'): {"revenue": 0.0, "cost": 0.0, "profit": 0.0} for d in date_range}
    
    for order in valid_orders:
        order_date = order.timestamp.date()
        if order_date < first_date:
            continue
            
        date_str = order_date.strftime('%b %d')
        
        for item in order.items:
            if item.seller_id == seller_id:
                revenue = item.price_at_purchase * item.quantity
                cost = item.cost_price_at_purchase * item.quantity
                profit = revenue - cost
                
                total_revenue += revenue
                total_cost += cost
                total_profit += profit
                total_items_sold += item.quantity
                
                if date_str in daily_metrics:
                    daily_metrics[date_str]["revenue"] += revenue
                    daily_metrics[date_str]["cost"] += cost
                    daily_metrics[date_str]["profit"] += profit
                    
    # Format for JSON React frontend and calculate daily margins
    chart_data = []
    for date, metrics in daily_metrics.items():
        margin = (metrics["profit"] / metrics["revenue"] * 100) if metrics["revenue"] > 0 else 0
        chart_data.append({
            "date": date,
            "revenue": metrics["revenue"],
            "expenses": metrics["cost"], # Mapped to variable expenses
            "profit": metrics["profit"],
            "margin": round(margin, 2)
        })
    
    overall_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "total_revenue": total_revenue,
        "total_expenses": total_cost,
        "total_profit": total_profit,
        "total_items_sold": total_items_sold,
        "overall_margin": round(overall_margin, 2),
        "chart_data": chart_data
    }

# --- ADMIN QUERIES ---
def get_all_global_orders():
    return Order.objects().order_by('-timestamp')

# --- ADMIN FINANCIAL DASHBOARD (SNAPSHOT) ---
def get_admin_dashboard_stats():
    """Calculates high-level metrics: Budget, ROI, EVM and Margins."""
    orders = Order.objects().order_by('-timestamp')
    total_revenue, total_cost = 0, 0
    
    # Calculate global revenue and costs
    for order in orders:
        for item in order.items:
            total_revenue += (item.price_at_purchase * item.quantity)
            total_cost += (item.cost_price_at_purchase * item.quantity)
            
    total_profit = total_revenue - total_cost
    roi = ((total_profit / total_cost) * 100) if total_cost > 0 else 0
    margin = ((total_profit / total_revenue) * 100) if total_revenue > 0 else 0
    
    # Mock Enterprise Budgets (For UI Demonstration)
    target_budget = 500000 
    budget_variance = total_revenue - target_budget

    # EVM Metrics (Earned Value Management)
    planned_value = target_budget * 0.8 # 80% expected completion
    earned_value = total_revenue
    actual_cost = total_cost
    cpi = (earned_value / actual_cost) if actual_cost > 0 else 1 # Cost Performance Index

    return {
        "revenue": total_revenue,
        "costs": total_cost,
        "profit": total_profit,
        "margin": round(margin, 2),
        "roi": round(roi, 2),
        "target_budget": target_budget,
        "budget_variance": budget_variance,
        "evm": {
            "pv": planned_value,
            "ev": earned_value,
            "ac": actual_cost,
            "cpi": round(cpi, 2)
        }
    }

# --- ADMIN ANALYTICS (DEEP DIVE) ---
def get_admin_analytics_stats():
    """Calculates granular data: Forecasting, Segments, and extracts logs."""
    orders = list(Order.objects().order_by('timestamp'))
    
    # 1. Product Segment Success
    product_sales = {}
    
    for order in orders:
        for item in order.items:
            rev = item.price_at_purchase * item.quantity
            if item.name not in product_sales:
                product_sales[item.name] = {"revenue": 0, "qty": 0}
            product_sales[item.name]["revenue"] += rev
            product_sales[item.name]["qty"] += item.quantity

    # Sort segments by top 5 revenue generators
    top_segments = sorted([{"name": k, "revenue": v["revenue"], "qty": v["qty"]} for k, v in product_sales.items()], key=lambda x: x["revenue"], reverse=True)[:5]
    
    # 2. Performance Forecasting (Continuous 14-day timeline)
    chart_data = []
    end_date = get_ist_now().date()
    start_date = end_date - timedelta(days=13)
    
    # Generate a blank 14-day slate
    daily_revenue = { (start_date + timedelta(days=i)).strftime('%b %d'): 0.0 for i in range(14) }
    
    if orders:
        for order in orders:
            order_date = order.timestamp.date()
            if start_date <= order_date <= end_date:
                date_str = order_date.strftime('%b %d')
                for item in order.items:
                    daily_revenue[date_str] += (item.price_at_purchase * item.quantity)
                    
    chart_data = [{"date": k, "revenue": v} for k, v in daily_revenue.items()]

    # 3. Generate Audit/Activity Logs from real recent events
    from models.users import User
    recent_users = User.objects().order_by('-id')[:5]
    recent_orders = Order.objects().order_by('-timestamp')[:5]
    
    audit_logs = []
    for u in recent_users:
        audit_logs.append({"timestamp": u.id.generation_time.isoformat(), "action": f"New {u.role.upper()} registered", "entity": u.username, "type": "auth"})
    for o in recent_orders:
        buyer = getattr(o.user, 'username', 'Unknown') if o.user else 'Unknown'
        audit_logs.append({"timestamp": o.timestamp.isoformat(), "action": f"Order {o.status}", "entity": f"Order {str(o.id)[-6:]} by {buyer}", "type": "system"})
        
    audit_logs.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "top_segments": top_segments,
        "timeline": chart_data,
        "audit_logs": audit_logs[:10] 
    }