from . import db
from mongoengine import StringField, DateTimeField, IntField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, ListField
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
	price = IntField(required=True)
	category = StringField(choices=['general', 'electronics', 'food'], default='general')
	stock_quantity = IntField(required=True)
	image_url = StringField(required=True)
	specifications = ListField(EmbeddedDocumentField(Specification))
	created_at = DateTimeField(default=get_ist_now)

def getallproducts():
	return Product.objects.all()

def add_product(name, description, seller, price, category, stock_quantity, image_url, specifications):
	product = Product(
		name=name, 
		description=description, 
		seller=seller, 
		price=price, 
		category=category, 
		stock_quantity=stock_quantity, 
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