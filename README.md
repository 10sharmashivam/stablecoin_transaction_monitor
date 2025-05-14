# stablecoin_transaction_monitor

# Stablecoin Transaction Monitor

A Python-based tool to monitor stablecoin transactions (e.g., USDC) on Ethereum’s Sepolia testnet. Built with Web3.py, Flask, PostgreSQL, AWS S3, and Docker, it provides a dashboard for transaction volume and fraud detection. Designed for stablecoin payment platforms like Mural Pay to ensure compliance.

## Features
- Fetches USDC transactions via Alchemy API.
- Implements fraud detection using Sklearn’s Isolation Forest.
- Stores data in PostgreSQL and AWS S3.
- Displays real-time dashboard with Flask.
- Deployed via AWS Elastic Beanstalk with Docker.

## Setup
1. Clone the repository: `git clone https://github.com/10sharmashivam/stablecoin_transaction_monitor.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Set environment variables (e.g., `ALCHEMY_API_KEY`, `AWS_S3_BUCKET`, `DATABASE_URL`).
4. Run the app: `python run.py`
5. Deploy to Elastic Beanstalk: `eb deploy`

## Deployment
- Uses Docker and AWS Elastic Beanstalk.
- Configure `.ebextensions/` for environment setup.
- Run `scripts/prebuild.sh` during deployment.

