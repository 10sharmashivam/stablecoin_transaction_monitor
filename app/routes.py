from flask import Blueprint, render_template
from .models import Transaction
from sqlalchemy import func
from datetime import datetime, timedelta

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """Render the homepage."""

    return render_template('index.html')

@bp.route('/dashboard')
def dashboard():
    # Last 24 hours transactions
    """
    Render the dashboard page.

    The dashboard displays the following information for the last 24 hours:
    - a list of all transactions
    - the total volume of all transactions
    - the number of fraudulent transactions
    """
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    transactions = Transaction.query.filter(Transaction.timestamp >= time_threshold).all()
    total_volume = sum(t.amount for t in transactions)
    fraud_count = sum(1 for t in transactions if t.is_fraud)
    return render_template('dashboard.html', transactions=transactions, total_volume=total_volume, fraud_count=fraud_count)