from app import create_app, db
from app.models import Transaction

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")

if __name__ == '__main__':
    init_db() 