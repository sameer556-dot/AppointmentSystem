import os
import secrets

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATABASE_DIR = os.path.join(PROJECT_ROOT, 'database')
DATABASE_PATH = os.path.join(DATABASE_DIR, 'appointments.db')

IS_VERCEL = bool(os.environ.get('VERCEL'))
ENV = os.environ.get('VERCEL_ENV', os.environ.get('FLASK_ENV', 'development')).lower()
IS_PRODUCTION = ENV in ('production', 'prod') or bool(os.environ.get('VERCEL_ENV') == 'production')

class Config:
    # Secret Key: in production, require SECRET_KEY or generate a strong random token per process, never static dev key
    _raw_secret = os.environ.get('SECRET_KEY')
    if IS_PRODUCTION and not _raw_secret:
        SECRET_KEY = secrets.token_hex(32)
    else:
        SECRET_KEY = _raw_secret or 'dev-secret-key-appointment-booking'

    _raw_db_url = os.environ.get('DATABASE_URL')
    if _raw_db_url:
        # SQLAlchemy 1.4+ and 2.0+ require postgresql:// instead of legacy postgres://
        if _raw_db_url.startswith('postgres://'):
            _raw_db_url = _raw_db_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = _raw_db_url
    elif IS_VERCEL:
        # On Vercel serverless functions, the root filesystem is read-only; use /tmp for fallback SQLite
        SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/appointments.db'
    else:
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }

    # Debug mode: strictly disabled in production
    DEBUG = False if IS_PRODUCTION else (os.environ.get('FLASK_DEBUG', 'false').lower() in ('true', '1', 't'))

    # CORS configuration: explicit origins or comma-separated list; allows localhost for development
    _raw_cors = os.environ.get('CORS_ORIGINS')
    if _raw_cors:
        if _raw_cors.strip() == '*':
            CORS_ORIGINS = ['*']
        else:
            CORS_ORIGINS = [orig.strip() for orig in _raw_cors.split(',') if orig.strip()]
    elif IS_VERCEL:
        # On Vercel, allow deployed vercel.app frontend and localhost by default
        CORS_ORIGINS = [r"^https://.*\.vercel\.app$", 'http://localhost:5173', 'http://127.0.0.1:5173']
    elif IS_PRODUCTION:
        CORS_ORIGINS = []
    else:
        CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']
