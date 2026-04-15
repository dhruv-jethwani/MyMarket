from . import db
from mongoengine import StringField, EmailField, IntField, DateTimeField, EmbeddedDocument, EmbeddedDocumentField
from datetime import datetime, timedelta, timezone
from werkzeug.security import check_password_hash
    
IST = timezone(timedelta(hours=5, minutes=30))
def get_ist_now():
    return datetime.now(IST)

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
	role = StringField(choices=['admin', 'seller', 'customer'], default='customer')
	address = EmbeddedDocumentField(Address)
	createdat = DateTimeField(default=get_ist_now)
     
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

def get_user_by_username(uname):
	return User.objects(username=uname).first()

def verify_password(user, password):
	if not user:
		return False
	return check_password_hash(user.password, password)