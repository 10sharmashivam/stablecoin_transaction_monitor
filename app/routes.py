from flask import Blueprint, render_template, jsonify
from .models import Transaction
from sqlalchemy import func
from datetime import datetime, timedelta
from app import db
from web3 import Web3
import json
import requests
import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np
from config import Config

bp = Blueprint('main', __name__)

def get_web3():
    """Initialize Web3 connection using Alchemy API URL"""
    if not Config.ALCHEMY_API_URL:
        raise ValueError("ALCHEMY_API_URL not set in environment variables")
    return Web3(Web3.HTTPProvider(Config.ALCHEMY_API_URL))

def get_token_balances(address):
    """Get token balances for a given address using Alchemy API"""
    if not Config.ALCHEMY_API_URL:
        raise ValueError("ALCHEMY_API_URL not set in environment variables")
        
    headers = {'Content-Type': 'application/json'}
    payload = {
        "jsonrpc": "2.0",
        "method": "alchemy_getTokenBalances",
        "params": [address, "erc20", {"maxCount": 100}],
        "id": 0
    }
    
    try:
        response = requests.post(Config.ALCHEMY_API_URL, headers=headers, json=payload)
        data = response.json()
        if 'result' in data and 'tokenBalances' in data['result']:
            return data['result']['tokenBalances']
        return []
    except Exception as e:
        print(f"Error fetching token balances: {e}")
        return []

def fetch_transactions():
    w3 = get_web3()
    current_block = w3.eth.block_number
    start_block = current_block - 2000  # Reduced to 2000 blocks to stay within Alchemy's limits

    # USDC contract ABI (minimal for transfer events)
    abi = json.loads('[{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]')
    
    try:
        contract = w3.eth.contract(address=Config.USDC_CONTRACT_ADDRESS, abi=abi)
        
        # Get transfer events with pagination
        transfer_filter = contract.events.Transfer.create_filter(
            fromBlock=start_block,
            toBlock=current_block
        )
        
        try:
            events = transfer_filter.get_all_entries()
            print(f"Found {len(events)} transfer events")
            
            # Process events in smaller batches to avoid database locks
            batch_size = 50  # Reduced batch size
            for i in range(0, len(events), batch_size):
                batch = events[i:i + batch_size]
                try:
                    with db.session.begin_nested():  # Create a savepoint
                        for event in batch:
                            # Check if transaction already exists
                            if not Transaction.query.filter_by(tx_hash=event['transactionHash'].hex()).first():
                                # USDC has 6 decimals, but we'll store the raw value and format in the view
                                amount = float(event['args']['value']) / 1e6
                                tx = Transaction(
                                    tx_hash=event['transactionHash'].hex(),
                                    from_address=event['args']['from'],
                                    to_address=event['args']['to'],
                                    amount=amount,
                                    block_number=event['blockNumber'],
                                    timestamp=datetime.fromtimestamp(w3.eth.get_block(event['blockNumber'])['timestamp'])
                                )
                                db.session.add(tx)
                        db.session.commit()
                except Exception as e:
                    print(f"Error processing batch {i} to {i + batch_size}: {str(e)}")
                    db.session.rollback()
                    continue  # Continue with next batch even if this one fails
            
            detect_anomalies()
        except Exception as e:
            print(f"Error fetching events: {str(e)}")
            db.session.rollback()
            # If we get a response size error, try with a smaller range
            if "Log response size exceeded" in str(e):
                print("Attempting to fetch with smaller block range...")
                mid_block = (start_block + current_block) // 2
                # Recursively fetch first half
                fetch_transactions_range(start_block, mid_block)
                # Recursively fetch second half
                fetch_transactions_range(mid_block + 1, current_block)
    except Exception as e:
        print(f"Error in fetch_transactions: {str(e)}")
        db.session.rollback()
        raise

def fetch_transactions_range(start_block, end_block):
    """Helper function to fetch transactions for a specific block range"""
    w3 = get_web3()
    abi = json.loads('[{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]')
    
    try:
        contract = w3.eth.contract(address=Config.USDC_CONTRACT_ADDRESS, abi=abi)
        transfer_filter = contract.events.Transfer.create_filter(
            fromBlock=start_block,
            toBlock=end_block
        )
        
        events = transfer_filter.get_all_entries()
        print(f"Found {len(events)} transfer events in blocks {start_block} to {end_block}")
        
        for event in events:
            if not Transaction.query.filter_by(tx_hash=event['transactionHash'].hex()).first():
                tx = Transaction(
                    tx_hash=event['transactionHash'].hex(),
                    from_address=event['args']['from'],
                    to_address=event['args']['to'],
                    amount=float(event['args']['value']) / 1e6,
                    block_number=event['blockNumber'],
                    timestamp=datetime.fromtimestamp(w3.eth.get_block(event['blockNumber'])['timestamp'])
                )
                db.session.add(tx)
        
        db.session.commit()
    except Exception as e:
        print(f"Error fetching transactions for blocks {start_block} to {end_block}: {str(e)}")
        db.session.rollback()

def detect_anomalies():
    # Get recent transactions
    recent_txs = Transaction.query.order_by(Transaction.timestamp.desc()).limit(1000).all()
    
    if len(recent_txs) < 10:  # Need minimum data for anomaly detection
        return
    
    # Prepare data for anomaly detection
    data = pd.DataFrame([{
        'amount': tx.amount,
        'hour': tx.timestamp.hour,
        'day': tx.timestamp.weekday(),
        'block_number': tx.block_number
    } for tx in recent_txs])
    
    # Calculate additional features
    data['amount_zscore'] = (data['amount'] - data['amount'].mean()) / data['amount'].std()
    data['time_diff'] = data['block_number'].diff().abs()
    
    # Train isolation forest with adjusted parameters
    clf = IsolationForest(
        contamination=0.05,  # Reduced to 5% as we expect fewer anomalies
        random_state=42,
        n_estimators=100
    )
    
    # Use multiple features for anomaly detection
    features = ['amount_zscore', 'time_diff']
    scores = clf.fit_predict(data[features])
    
    # Update anomaly scores and status
    for tx, score in zip(recent_txs, scores):
        tx.is_anomaly = score == -1
        tx.anomaly_score = float(clf.score_samples(data[features].iloc[[i]])[0])
    
    db.session.commit()

def get_dashboard_data():
    # Get last 24 hours of transactions
    day_ago = datetime.utcnow() - timedelta(days=1)
    transactions = Transaction.query.filter(Transaction.timestamp >= day_ago).all()
    
    # Prepare time series data
    hourly_data = {}
    for tx in transactions:
        hour = tx.timestamp.replace(minute=0, second=0, microsecond=0)
        if hour not in hourly_data:
            hourly_data[hour] = {'volume': 0, 'count': 0, 'anomalies': 0}
        hourly_data[hour]['volume'] += tx.amount
        hourly_data[hour]['count'] += 1
        if tx.is_anomaly:
            hourly_data[hour]['anomalies'] += 1
    
    return {
        'hourly_data': hourly_data,
        'total_volume': sum(tx.amount for tx in transactions),
        'total_transactions': len(transactions),
        'anomaly_count': sum(1 for tx in transactions if tx.is_anomaly)
    }

@bp.route('/')
def index():
    """Render the homepage."""
    return render_template('index.html')

@bp.route('/dashboard')
def dashboard():
    """Render the dashboard page."""
    try:
        # Last 24 hours transactions
        time_threshold = datetime.utcnow() - timedelta(hours=24)
        transactions = Transaction.query.filter(Transaction.timestamp >= time_threshold).all()
        
        # Calculate statistics
        total_volume = sum(t.amount for t in transactions)
        transaction_count = len(transactions)
        avg_transaction = total_volume / transaction_count if transaction_count > 0 else 0
        fraud_count = sum(1 for t in transactions if t.is_anomaly)
        
        return render_template('dashboard.html', 
                             transactions=transactions, 
                             total_volume=total_volume,
                             transaction_count=transaction_count,
                             avg_transaction=avg_transaction,
                             fraud_count=fraud_count)
    except Exception as e:
        print(f"Error in dashboard route: {str(e)}")
        return render_template('dashboard.html', 
                             transactions=[], 
                             total_volume=0,
                             transaction_count=0,
                             avg_transaction=0,
                             fraud_count=0)

@bp.route('/api/dashboard-data')
def dashboard_data():
    """API endpoint for dashboard data"""
    try:
        # Get last 24 hours of transactions
        day_ago = datetime.utcnow() - timedelta(days=1)
        transactions = Transaction.query.filter(Transaction.timestamp >= day_ago).all()
        
        # If no transactions, return empty data structure
        if not transactions:
            return jsonify({
                'hourly_data': {},
                'total_volume': 0,
                'total_transactions': 0,
                'anomaly_count': 0
            })
        
        # Prepare time series data
        hourly_data = {}
        for tx in transactions:
            hour = tx.timestamp.replace(minute=0, second=0, microsecond=0)
            if hour not in hourly_data:
                hourly_data[hour] = {'volume': 0, 'count': 0, 'anomalies': 0}
            hourly_data[hour]['volume'] += tx.amount
            hourly_data[hour]['count'] += 1
            if tx.is_anomaly:
                hourly_data[hour]['anomalies'] += 1
        
        # Convert datetime objects to strings for JSON serialization
        formatted_data = {
            'hourly_data': {
                hour.isoformat(): data 
                for hour, data in hourly_data.items()
            },
            'total_volume': sum(tx.amount for tx in transactions),
            'total_transactions': len(transactions),
            'anomaly_count': sum(1 for tx in transactions if tx.is_anomaly)
        }
        
        return jsonify(formatted_data)
    except Exception as e:
        print(f"Error in dashboard_data: {str(e)}")
        return jsonify({
            'hourly_data': {},
            'total_volume': 0,
            'total_transactions': 0,
            'anomaly_count': 0,
            'error': str(e)
        }), 500

@bp.route('/api/transactions')
def get_transactions():
    """API endpoint for recent transactions"""
    try:
        transactions = Transaction.query.order_by(Transaction.timestamp.desc()).limit(50).all()
        return jsonify([{
            'tx_hash': tx.tx_hash,
            'from_address': tx.from_address,
            'to_address': tx.to_address,
            'amount': tx.amount,
            'timestamp': tx.timestamp.isoformat(),
            'is_anomaly': tx.is_anomaly,
            'anomaly_score': tx.anomaly_score
        } for tx in transactions])
    except Exception as e:
        print(f"Error in get_transactions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/token-balances/<address>')
def token_balances(address):
    """API endpoint to get token balances for an address"""
    balances = get_token_balances(address)
    return jsonify(balances)