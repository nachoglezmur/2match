"""
Script para inicializar la base de datos con datos de prueba
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app, db
from backend.models import Event, Participant, MatchAction
from datetime import datetime, timedelta


def init_db():
    """Inicializar la base de datos y crear datos de prueba"""
    app = create_app()
    
    with app.app_context():
        print("🔄 Iniciando creación de tablas...")
        print(f"📊 Database URI: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
        
        try:
            # Borrar y recrear el esquema para eliminar todo
            db.session.execute(db.text('DROP SCHEMA public CASCADE;'))
            db.session.execute(db.text('CREATE SCHEMA public;'))
            db.session.commit()
            print("🗑️ Esquema 'public' eliminado y recreado")

            # Crear todas las tablas
            db.create_all()
            print("✅ Tablas creadas exitosamente")
            
            # Verificar las tablas creadas
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📋 Tablas en la base de datos: {', '.join(tables)}")
            
            print("\n🎉 Base de datos inicializada correctamente!")
            
        except Exception as e:
            print(f"❌ Error al inicializar la base de datos: {str(e)}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    init_db()