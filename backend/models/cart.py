from . import db
from mongoengine import IntField, DateTimeField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, ListField
from datetime import datetime, timedelta, timezone

IST = timezone(timedelta(hours=5, minutes=30))
def get_ist_now():
    return datetime.now(IST)

class CartItem(EmbeddedDocument):
    product = ReferenceField('Product', required=True)
    quantity = IntField(required=True, min_value=1, default=1)

class Cart(db.Document):
    meta = {'collection' : 'cart'}
    user = ReferenceField('User', required=True, unique=True, reverse_delete_rule=db.CASCADE)
    items = ListField(EmbeddedDocumentField(CartItem), default=list)
    updated_at = DateTimeField(default=get_ist_now)
    def save(self, *args, **kwargs):
        self.updated_at = get_ist_now()
        return super(Cart, self).save(*args, **kwargs)
    
def get_create_cart(user_id):
    cart = Cart.objects(user=user_id).first()
    if not cart:
        cart = Cart(user=user_id).save()
    return cart

def clear_cart(user_id):
    cart = Cart.objects(user=user_id).first()
    cart.items = []
    return cart.save()