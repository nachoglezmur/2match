import os
from pathlib import Path
from dotenv import load_dotenv

# Buscar el archivo .env en el directorio padre (raíz del proyecto)
# Este archivo está en backend/, así que subimos un nivel
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# También cargar desde el directorio actual por si acaso
load_dotenv()


class Config:
    """Configuración base"""
    DEBUG = False
    TESTING = False
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///2match.db")
    
    # Render y algunas plataformas usan postgres:// en lugar de postgresql://
    # SQLAlchemy requiere postgresql://
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace(
            "postgres://", "postgresql://", 1
        )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # Verificar conexiones antes de usar
        "pool_recycle": 300,    # Reciclar conexiones cada 5 minutos
    }
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Mostrar queries SQL en consola


class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")


class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    TESTING = False
    
    # En producción, asegurarse de que hay SECRET_KEY
    if Config.SECRET_KEY == "change-me-in-production":
        raise ValueError("SECRET_KEY debe estar definido en producción")


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name: str | None = None) -> type[Config]:
    """Obtener configuración por nombre de ambiente"""
    if not name:
        name = os.getenv("FLASK_ENV", "development")
    return config_by_name.get(name, DevelopmentConfig)