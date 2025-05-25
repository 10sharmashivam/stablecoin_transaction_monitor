from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    """
    Create and configure a Flask application.

    This function creates and configures a Flask application. 
    It sets the configuration from the Config class, initializes the database, 
    imports the routes and models, and creates the database tables.

    Returns the configured Flask application.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)  # Enable CORS for all routes
    
    # Register blueprints
    from app.routes import bp
    app.register_blueprint(bp)
    
    with app.app_context():
        db.create_all()
    return app