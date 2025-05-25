from datetime import datetime
from app import db

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tx_hash = db.Column(db.String(66), unique=True, nullable=False)
    from_address = db.Column(db.String(42), nullable=False)
    to_address = db.Column(db.String(42), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    block_number = db.Column(db.Integer, nullable=False)
    is_anomaly = db.Column(db.Boolean, default=False)
    anomaly_score = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'tx_hash': self.tx_hash,
            'from_address': self.from_address,
            'to_address': self.to_address,
            'amount': self.amount,
            'timestamp': self.timestamp.isoformat(),
            'block_number': self.block_number,
            'is_anomaly': self.is_anomaly,
            'anomaly_score': self.anomaly_score
        }