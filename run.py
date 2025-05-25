from app import create_app
import threading
import time
from app.routes import fetch_transactions

app = create_app()

def monitor_transactions():
    with app.app_context():
        while True:
            try:
                fetch_transactions()
            except Exception as e:
                print(f"Error fetching transactions: {e}")
            time.sleep(60)  # Wait for 1 minute before next fetch

if __name__ == '__main__':
    # Start transaction monitoring in a separate thread
    monitor_thread = threading.Thread(target=monitor_transactions, daemon=True)
    monitor_thread.start()
    
    # Start Flask application
    app.run(host='0.0.0.0', port=5006, debug=True)