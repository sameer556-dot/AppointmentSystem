"""
Database Migration and Schema Verification Script for AppointEase.
Compatible with both SQLite and Neon PostgreSQL.

Usage:
    # Against local SQLite:
    python scratch/migrate_appointments_table.py

    # Against Neon PostgreSQL:
    # On Windows PowerShell:
    #   $env:DATABASE_URL="postgresql://user:password@ep-...neon.tech/neondb?sslmode=require"
    #   python scratch/migrate_appointments_table.py
    # On Linux/macOS:
    #   DATABASE_URL="postgresql://user:password@ep-...neon.tech/neondb?sslmode=require" python scratch/migrate_appointments_table.py
"""
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app, init_db
from backend.models import db, Category, Provider, Appointment

def run_migration():
    app = create_app()
    with app.app_context():
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        dialect = db.engine.dialect.name
        masked_uri = db_uri
        if '@' in masked_uri:
            # Mask credentials for safe logging
            prefix = masked_uri.split('@')[0].split('://')[0]
            host_part = masked_uri.split('@')[-1]
            masked_uri = f"{prefix}://***:***@{host_part}"

        print(f"[*] Target Database Dialect: {dialect}")
        print(f"[*] Target Database URI:     {masked_uri}")
        print("[*] Running idempotent initialization and schema verification...")
        
        init_db(app)
        
        cat_count = Category.query.count()
        prov_count = Provider.query.count()
        appt_count = Appointment.query.count()
        
        print("[+] Schema & seed verification complete:")
        print(f"    - Categories:   {cat_count}")
        print(f"    - Providers:    {prov_count}")
        print(f"    - Appointments: {appt_count}")
        print("[+] Migration finished successfully.")

if __name__ == '__main__':
    run_migration()
