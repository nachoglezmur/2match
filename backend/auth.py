from functools import wraps
from flask import g, abort, redirect, url_for, session, request
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

oauth = OAuth()

def init_app(app):
    oauth.init_app(app)
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
        client_kwargs={'scope': 'openid email profile'},
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    )

    @app.route('/api/login/google')
    def login():
        redirect_uri = url_for('auth_callback', _external=True)
        return google.authorize_redirect(redirect_uri)

    @app.route('/api/login/google/callback')
    def auth_callback():
        token = google.authorize_access_token()
        user_info = google.get('userinfo').json()

        user = User.query.filter_by(google_id=user_info['id']).first()
        if not user:
            user = User(
                google_id=user_info['id'],
                email=user_info['email'],
                name=user_info['name'],
                picture=user_info['picture'],
            )
            db.session.add(user)
        else:
            user.name = user_info['name']
            user.picture = user_info['picture']

        db.session.commit()

        session['user_id'] = str(user.id)
        session['user_info'] = user_info

        # Redirect to the frontend
        return redirect(os.getenv('FRONTEND_URL', 'http://localhost:5173'))

    @app.route('/api/logout')
    def logout():
        session.pop('user_id', None)
        session.pop('user_info', None)
        return redirect(os.getenv('FRONTEND_URL', 'http://localhost:5173'))

    @app.route('/api/me')
    def me():
        if g.user:
            return {'logged_in': True, 'user_info': session.get('user_info')}
        else:
            return {'logged_in': False}

    @app.before_request
    def load_logged_in_user():
        user_id = session.get('user_id')
        if user_id is None:
            g.user = None
        else:
            g.user = User.query.get(user_id)