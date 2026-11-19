import os
import sys

# Ensure backend directory is in sys.path so sibling modules (app, models, config, etc.) resolve cleanly
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

class VercelPathFixer:
    """WSGI Middleware to restore original request path and query string on Vercel Serverless rewrites."""
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        matched_path = (
            environ.get('HTTP_X_VERCEL_MATCHED_PATH')
            or environ.get('REQUEST_URI')
            or environ.get('RAW_URI')
        )
        if matched_path:
            parts = matched_path.split('?', 1)
            path_only = parts[0]
            if len(parts) > 1 and not environ.get('QUERY_STRING'):
                environ['QUERY_STRING'] = parts[1]
            if path_only not in ('/api/index', '/api/index.py'):
                environ['PATH_INFO'] = path_only
        return self.wsgi_app(environ, start_response)

app.wsgi_app = VercelPathFixer(app.wsgi_app)
