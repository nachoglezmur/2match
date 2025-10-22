# backend/app.py
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from .extensions import db
from .config import get_config


def create_app(config_name: str | None = None) -> Flask:
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Cargar configuración
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development")
    
    app_config = get_config(config_name)
    app.config.from_object(app_config)
    
    # Configurar logging
    if config_name == "production":
        logging.basicConfig(level=logging.INFO)
    else:
        logging.basicConfig(level=logging.DEBUG)
    
    # Inicializar extensiones
    db.init_app(app)
    
    # Configurar CORS
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "https://nachoglezmur.github.io",
                    "http://localhost:5173",
                    "https://backend-7g2c.onrender.com"
                ],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "expose_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "max_age": 3600
            }
        },
        supports_credentials=True
    )
    
    # Ensure secure session cookies in production
    if config_name == 'production':
        app.config.update(
            SESSION_COOKIE_SECURE=True,
            SESSION_COOKIE_HTTPONLY=True,
            SESSION_COOKIE_SAMESITE='None'
        )
    
    # Registrar blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")
    
    # Inicializar autenticación
    from . import auth
    auth.init_app(app)
    
    # Ruta de salud
    @app.route("/health", methods=["GET"])
    def health_check():
        try:
            # Verificar conexión a la base de datos
            db.session.execute(db.text('SELECT 1'))
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
            app.logger.error(f"Database connection error: {str(e)}")
        
        return {
            "status": "healthy",
            "environment": config_name,
            "database": db_status
        }
    
    @app.route('/url_map')
    def url_map():
        """Debug endpoint to list all registered routes"""
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': sorted(rule.methods),
                'path': str(rule)
            })
        return jsonify(routes)
    
    with app.app_context():
        # Import models to register with SQLAlchemy
        from . import models  # noqa: F401
    
    return app


app = create_app()