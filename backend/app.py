from __future__ import annotations

import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from .config import get_config

# Global extensions
db = SQLAlchemy()


def create_app(config_name: str | None = None) -> Flask:
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Cargar configuración
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development")
    
    app_config = get_config(config_name)
    app.config.from_object(app_config)

    # Inicializar extensiones
    db.init_app(app)
    
    # Configurar CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', ['*']),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    # Registrar blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    # Ruta de salud
    @app.route("/health", methods=["GET"])
    def health_check():
        try:
            # Verificar conexión a la base de datos
            db.session.execute(db.text('SELECT 1'))
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        return {
            "status": "healthy",
            "environment": config_name,
            "database": db_status
        }

    with app.app_context():
        # Import models to register with SQLAlchemy metadata
        from . import models  # noqa: F401

        # Configure logging
        if config_name == "production":
            logging.basicConfig(level=logging.INFO)
        else:
            logging.basicConfig(level=logging.DEBUG)

    return app


# Crear la aplicación
app = create_app()


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)