from app.utils.alchemy_api import get_usdc_transactions
from app.utils.fraud_detection import detect_fraud
from app.utils.s3_storage import store_transactions_to_s3
from app import db, models
import os

def main():
    api_key = os.getenv('ALCHEMY_API_KEY')
    bucket_name = os.getenv('AWS_S3_BUCKET')
    
    # Fetch transactions
    transactions = get_usdc_transactions(api_key)
    if not transactions:
        print("No transactions fetched")
        return
    
    # Detect fraud
    transactions = detect_fraud(transactions)
    
    # Store to S3
    s3_key = store_transactions_to_s3(transactions, bucket_name)
    print(f"Stored transactions to S3: {s3_key}")
    
    # Store to PostgreSQL
    for tx in transactions:
        transaction = models.Transaction(
            tx_hash=tx['hash'],
            amount=tx['amount'],
            sender=tx['sender'],
            receiver=tx['receiver'],
            timestamp=tx['timestamp'],
            is_fraud=tx['is_fraud']
        )
        db.session.add(transaction)
    db.session.commit()
    print("Stored transactions to PostgreSQL")

if __name__ == '__main__':
    main()