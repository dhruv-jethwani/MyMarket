from . import db
from mongoengine import StringField, FloatField, DateTimeField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, ListField, IntField
from datetime import datetime, timedelta, timezone

IST = timezone(timedelta(hours=5, minutes=30))
def get_ist_now():
    return datetime.now(IST)

class OrderItem(EmbeddedDocument):
    name = StringField(required=True)
    price_at_purchase = FloatField(required=True)
    quantity = IntField(required=True)

class Order(db.Document):
    meta = {'collection': 'orders'}
    user = ReferenceField('User', required=True, reverse_delete_rule=db.CASCADE)
    items = ListField(EmbeddedDocumentField(OrderItem), default=list)
    total_amount = FloatField(required=True)
    status = StringField(choices=['Pending', 'Paid', 'Shipped', 'Delivered'], default='Pending')
    gateway_ref = StringField()
    timestamp = DateTimeField(default=get_ist_now)

def create_order(user_id, items, total_amount, status, gateway_ref):
    order = Order(
        user=user_id,
        items=items,
        total_amount=total_amount,
        status=status,
        gateway_ref=gateway_ref
    )
    return order.save()