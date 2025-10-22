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
        
        # Configure Google OAuth
        google = oauth.register(
            name='google',
            client_id=os.getenv('GOOGLE_CLIENT_ID'),
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile',
                'prompt': 'select_account',
            },
        )

        @app.route('/api/login/google')
        def login():
            # Store the return_to parameter in the session
            return_to = request.args.get('return_to', '')
            session['return_to'] = return_to
            
            # Get the base redirect URI from environment or generate it
            configured_redirect = os.getenv('GOOGLE_REDIRECT_URI')
            redirect_uri = configured_redirect or url_for('auth_callback', _external=True)
            
            # Ensure HTTPS in production
            if not redirect_uri.startswith('https://') and os.getenv('FLASK_ENV') == 'production':
                redirect_uri = redirect_uri.replace('http://', 'https://', 1)
            
            # Store redirect_uri in session so callback can use the same one
            session['oauth_redirect_uri'] = redirect_uri
            
            app.logger.info(f"Initiating Google OAuth with redirect_uri: {redirect_uri}")
            return google.authorize_redirect(redirect_uri=redirect_uri, prompt='select_account')

        @app.route('/api/login/google/callback')
        def auth_callback():
            try:
                # Enable detailed logging
                import logging
                logging.basicConfig(level=logging.DEBUG)
                
                app.logger.info("=== Starting Google OAuth Callback ===")
                app.logger.info(f"Request URL: {request.url}")
                app.logger.info(f"Request args: {dict(request.args)}")
                
                # Get the authorization code from the query parameters
                code = request.args.get('code')
                error = request.args.get('error')
                state = request.args.get('state')
                
                app.logger.info(f"Code: {code}")
                app.logger.info(f"Error: {error}")
                app.logger.info(f"State: {state}")
                
                if error:
                    error_desc = request.args.get('error_description', 'No error description')
                    app.logger.error(f"Google OAuth error: {error} - {error_desc}")
                    return f"""
                    <h1>Authentication Error</h1>
                    <p>Error: {error}</p>
                    <p>Description: {error_desc}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                    <p><a href='/'>Return to Login</a></p>
                    """, 400
                
                if not code:
                    app.logger.error("No authorization code received from Google")
                    return """
                    <h1>Authentication Error</h1>
                    <p>No authorization code received from Google.</p>
                    <p>Please try again or contact support if the problem persists.</p>
                    <p><a href='/'>Return to Login</a></p>
                    """, 400
                
                # Exchange the authorization code for tokens
                try:
                    app.logger.info("Attempting to exchange code for token...")
                    
                    # Get the redirect_uri from session (same one used in initial request)
                    redirect_uri = session.get('oauth_redirect_uri')
                    
                    # Call authorize_access_token without explicit redirect_uri
                    # Authlib will automatically use the correct redirect_uri from the OAuth flow
                    token = google.authorize_access_token()
                    
                    app.logger.info("Token exchange successful")
                    
                    if not token:
                        app.logger.error("Token is None after exchange")
                        raise Exception("Failed to obtain access token from Google")
                        
                    app.logger.info(f"OAuth token received: {token}")
                    
                except Exception as token_error:
                    app.logger.error(f"Error during token exchange: {str(token_error)}")
                    return f"""
                    <h1>Authentication Error</h1>
                    <p>Failed to exchange authorization code for access token.</p>
                    <p>Error: {str(token_error)}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                    <p><a href='/'>Return to Login</a></p>
                    """, 400
                
                # Get user info from Google
                try:
                    app.logger.info("Attempting to fetch user info from Google...")
                    user_info = google.get('userinfo').json()
                    app.logger.info(f"User info received: {user_info}")
                    
                    if not user_info:
                        app.logger.error("No user info returned from Google")
                        return """
                        <h1>Authentication Error</h1>
                        <p>No user information received from Google.</p>
                        <p>Please try again or contact support if the problem persists.</p>
                        <p><a href='/'>Return to Login</a></p>
                        """, 400
                    
                    app.logger.info(f"User info from Google: {user_info}")
                    
                    # Handle both 'id' and 'sub' fields from Google
                    google_id = user_info.get('id') or user_info.get('sub')
                    if not google_id:
                        error_msg = f"Google user info missing both 'id' and 'sub' fields: {user_info}"
                        app.logger.error(error_msg)
                        return f"<h1>Authentication Error</h1><p>{error_msg}</p>", 400
                        
                except Exception as user_info_error:
                    app.logger.error(f"Error fetching user info: {str(user_info_error)}")
                    return f"""
                    <h1>Authentication Error</h1>
                    <p>Failed to fetch user information from Google.</p>
                    <p>Error: {str(user_info_error)}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                    <p><a href='/'>Return to Login</a></p>
                    """, 400

                # Ensure the ID is in the user_info for frontend
                if 'id' not in user_info:
                    user_info = {**user_info, 'id': google_id}

                # Find or create user
                user = User.query.filter_by(google_id=google_id).first()
                if not user:
                    # Validate required fields
                    if not all(key in user_info for key in ['email', 'name']):
                        error_msg = f"Missing required user fields in: {user_info}"
                        app.logger.error(error_msg)
                        return f"<h1>Authentication Error</h1><p>{error_msg}</p>", 400
                        
                    user = User(
                        google_id=google_id,
                        email=user_info['email'],
                        name=user_info['name'],
                        picture=user_info.get('picture'),
                    )
                    db.session.add(user)
                    app.logger.info(f"New user created: {user.email}")
                else:
                    # Update existing user
                    if 'name' in user_info:
                        user.name = user_info['name']
                    if 'picture' in user_info:
                        user.picture = user_info['picture']
                    app.logger.info(f"User logged in: {user.email}")

                db.session.commit()

                # Set session variables
                session['user_id'] = str(user.id)
                session['user_info'] = user_info
                
                # Clean up OAuth-related session data
                session.pop('oauth_redirect_uri', None)

                # Get the return_to path from session or use default
                return_to = session.pop('return_to', '')
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
                
                # Build the final redirect URL
                redirect_url = f"{frontend_url.rstrip('/')}{return_to}"
                app.logger.info(f"Authentication successful, redirecting to: {redirect_url}")
                
                # For debugging, you can return user info directly
                if os.getenv('FLASK_ENV') == 'development':
                    return f"""
                    <h1>Authentication Successful</h1>
                    <p>User: {user_info.get('name')} ({user_info.get('email')})</p>
                    <p>ID: {google_id}</p>
                    <p>Redirecting to: {redirect_url}</p>
                    <p><a href='{redirect_url}'>Continue to App</a></p>
                    """
                
                return redirect(redirect_url)
                
            except Exception as e:
                import traceback
                error_details = traceback.format_exc()
                app.logger.error(f"Unexpected error during authentication: {str(e)}\n{error_details}")
                return """
                <h1>Authentication Failed</h1>
                <p>An unexpected error occurred during authentication.</p>
                <p>Please try again or contact support if the problem persists.</p>
                <p><a href='/'>Return to Login</a></p>
                """, 500

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