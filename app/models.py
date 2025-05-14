from . import db
from datetime import datetime

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tx_hash = db.Column(db.String(66), unique=True, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    sender = db.Column(db.String(42), nullable=False)
    receiver = db.Column(db.String(42), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_fraud = db.Column(db.Boolean, default=False)