from sklearn.ensemble import IsolationForest
import numpy as np

def detect_fraud(transactions):
    # Extract features: amount, timestamp (convert to hour)
    """
    Detects fraudulent transactions in a list of transactions.

    Parameters
    ----------
    transactions : list
        A list of transactions, each represented as a dictionary with keys 'amount' and 'timestamp'.

    Returns
    -------
    list
        The same list of transactions, with an additional key 'is_fraud' set to True for transactions identified as fraudulent.
    """
    features = [[tx['amount'], tx['timestamp'] % (24 * 3600)] for tx in transactions]
    if not features:
        return []
    
    # Train Isolation Forest
    model = IsolationForest(contamination=0.1, random_state=42)
    predictions = model.fit_predict(features)
    
    # Mark transactions as fraud (prediction = -1)
    for i, tx in enumerate(transactions):
        tx['is_fraud'] = predictions[i] == -1
    return transactions