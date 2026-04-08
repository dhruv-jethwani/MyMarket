from . import db
from mongoengine import StringField, EmailField, IntField, DateTimeField, EnumField, EmbeddedDocument, EmbeddedDocumentField, QuerySet
from enum import Enum
from datetime import datetime
from werkzeug.security import check_password_hash
    
class Address(EmbeddedDocument):
    street = StringField()
    city = StringField()
    zip_code = IntField()

class User(db.Document):
	meta = {'collection': 'users'}
	fullname = StringField(required=True)
	username = StringField(unique=True, required=True)
	email = EmailField(unique=True, required=True)
	password = StringField(required=True)
	role = StringField(choices=['admin', 'manager', 'customer'], default='customer')
	address = EmbeddedDocumentField(Address, required=True)
	createdat = DateTimeField(default=datetime.now)
     
def getallusers():
	return User.objects.all()

def create_user(fullname, username, email, hashed_password, role, address):
	user = User(
        fullname=fullname,
        username=username,
        email=email,
        password=hashed_password,
        role=role,
        address=address
    )
	return user.save()

def get_user_by_username(username):
	return User.objects(username=username).first()

def verify_password(user, password):
	if not user:
		return False
	return check_password_hash(user.password, password)