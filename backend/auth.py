# In backend/auth.py
from functools import wraps
from flask import g, abort, redirect, url_for, session, request, current_app
from authlib.integrations.flask_client import OAuth
import os

from .app import db
from .models import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            abort(401)
        return f(*args, **kwargs)
    return decorated_function

# Initialize OAuth
oauth = OAuth()

def init_app(app):
    # Store app reference for url_for
    app_ctx = app.app_context()
    app_ctx.push()
    
    try:
        # Initialize OAuth with the app
        oauth.init_app(app)
        
        # Register Google OAuth
        google = oauth.register(
            name='google',
            client_id=os.getenv('GOOGLE_CLIENT_ID'),
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
            access_token_url='https://accounts.google.com/o/oauth2/token',
            access_token_params=None,
            authorize_url='https://accounts.google.com/o/oauth2/auth',
            authorize_params=None,
            api_base_url='https://www.googleapis.com/oauth2/v1/',
            userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
            client_kwargs={
                'scope': 'openid email profile',
                'prompt': 'select_account',
            },
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        )

        @app.route('/api/login/google')
        def login():
            # Ensure we're using HTTPS in production
            redirect_uri = url_for('auth_callback', _external=True)
            if app.config.get('ENV') == 'production' and not redirect_uri.startswith('https'):
                redirect_uri = redirect_uri.replace('http://', 'https://', 1)
            return google.authorize_redirect(redirect_uri, prompt='select_account')

        @app.route('/api/login/google/callback')
        def auth_callback():
            try:
                token = google.authorize_access_token()
                user_info = google.get('userinfo').json()

                user = User.query.filter_by(google_id=user_info['id']).first()
                if not user:
                    user = User(
                        google_id=user_info['id'],
                        email=user_info['email'],
                        name=user_info['name'],
                        picture=user_info.get('picture'),
                    )
                    db.session.add(user)
                else:
                    user.name = user_info['name']
                    user.picture = user_info.get('picture')

                db.session.commit()

                session['user_id'] = str(user.id)
                session['user_info'] = user_info

                # Redirect to the frontend
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
                return redirect(frontend_url)
            except Exception as e:
                app.logger.error(f"Auth error: {str(e)}")
                return {"error": "Authentication failed"}, 400

        @app.route('/api/logout')
        def logout():
            session.pop('user_id', None)
            session.pop('user_info', None)
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            return redirect(frontend_url)

        @app.route('/api/me')
        def me():
            if 'user_id' in session:
                return {
                    'logged_in': True, 
                    'user_info': session.get('user_info')
                }
            return {'logged_in': False}

        @app.route('/api/auth/health')
        def auth_health():
            return {'status': 'ok'}

        @app.before_request
        def load_logged_in_user():
            g.user = None
            if 'user_id' in session:
                g.user = User.query.get(session['user_id'])

        app.logger.info("Auth routes registered successfully")
        
    except Exception as e:
        app.logger.error(f"Failed to initialize auth: {str(e)}")
        raise
    finally:
        app_ctx.pop()