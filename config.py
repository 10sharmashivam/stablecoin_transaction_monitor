import os
from dotenv import load_dotenv

# Get the absolute path to the .env file in the app directory
app_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(app_dir, 'app', '.env')
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {os.path.exists(env_path)}")

# Load environment variables
load_dotenv(env_path)

# Debug print environment variables
print("Environment variables after loading:")
print(f"ALCHEMY_API_URL: {os.getenv('ALCHEMY_API_URL')}")
print(f"SECRET_KEY: {os.getenv('SECRET_KEY')}")

class Config:
    # Flask settings
    SECRET_KEY = 'dev-key-for-demo'
    
    # Database settings
    SQLALCHEMY_DATABASE_URI = 'sqlite:///stablecoin_monitor.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {'timeout': 30}  # Increase timeout for SQLite
    }
    
    # Alchemy API settings
    ALCHEMY_API_KEY = 'rfwQB8OillDjzA2Jmn5xD7yELbxf1oiI'
    ALCHEMY_API_URL = f"https://eth-sepolia.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
    
    # USDC Contract address on Sepolia
    USDC_CONTRACT_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    
    # Monitoring settings
    TRANSACTION_BATCH_SIZE = 100  # Number of transactions to fetch per request
    UPDATE_INTERVAL = 60  # Seconds between updates