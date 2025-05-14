from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app():
    """
    Create and configure a Flask application.

    This function creates and configures a Flask application. 
    It sets the configuration from the Config class, initializes the database, 
    imports the routes and models, and creates the database tables.

    Returns the configured Flask application.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    with app.app_context():
        from . import routes, models
        db.create_all()
    return app