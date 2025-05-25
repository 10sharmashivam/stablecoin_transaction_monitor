# Stablecoin Transaction Monitor

A real-time monitoring system for USDC transactions with advanced analytics and pattern detection capabilities. Built to demonstrate expertise in blockchain monitoring, real-time analytics, and secure cross-border payment systems.

## Features

- 🔍 Real-time USDC transaction monitoring
- 📊 Interactive analytics dashboard
- 🎯 Pattern detection and anomaly identification
- 🔐 Role-based access control
- 📈 Transaction volume and distribution analysis
- ⚡ Low-latency data processing

## Tech Stack

### Frontend
- React.js
- Material-UI
- Recharts for data visualization
- Axios for API communication

### Backend
- Python
- Flask
- Web3.py for blockchain interaction
- Pandas for data analysis
- Scikit-learn for anomaly detection

### Database
- PostgreSQL
- SQLAlchemy ORM

### Infrastructure
- Docker
- AWS/GCP ready
- RESTful API architecture

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stablecoin_transaction_monitor.git
cd stablecoin_transaction_monitor
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Configure environment variables:
```bash
# Backend (.env)
ALCHEMY_API_KEY=your_alchemy_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/stablecoin_monitor
JWT_SECRET_KEY=your_jwt_secret

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

5. Start the development servers:
```bash
# Backend
cd backend
flask run

# Frontend
cd frontend
npm start
```

## Project Structure

```
stablecoin_transaction_monitor/
├── backend/
│   ├── app/
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── utils/
│   ├── requirements.txt
│   └── config.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Key Features in Detail

### Real-time Monitoring
- Live tracking of USDC transactions
- Immediate anomaly detection
- Transaction pattern analysis

### Analytics Dashboard
- Transaction volume over time
- Hourly and daily distribution analysis
- Top addresses by volume
- Interactive charts and graphs

### Security Features
- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Input validation and sanitization

