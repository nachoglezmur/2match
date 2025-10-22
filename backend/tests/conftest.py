import pytest
from flask import redirect, request, session

from backend.app import create_app, db


class StubGoogleClient:
    def __init__(self):
        self.user_info = {}

    def authorize_redirect(self, redirect_uri=None, **kwargs):
        session["google_oauth_state"] = "stub-state"
        target = redirect_uri or request.args.get("redirect_uri") or "https://accounts.google.com/o/oauth2/auth"
        return redirect(target)

    def authorize_access_token(self):
        if request.args.get("state") != session.get("google_oauth_state"):
            raise RuntimeError("Invalid state")
        return {"access_token": "stub-token"}

    def get(self, endpoint):
        class Response:
            def __init__(self, data):
                self._data = data

            def json(self):
                return self._data

        return Response(self.user_info)


@pytest.fixture
def google_stub(monkeypatch):
    stub = StubGoogleClient()

    def register(*args, **kwargs):
        return stub

    monkeypatch.setattr("backend.auth.oauth.register", register)
    return stub


@pytest.fixture
def app(monkeypatch, google_stub, tmp_path):
    monkeypatch.setenv("FLASK_ENV", "testing")
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("TEST_DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key")
    monkeypatch.setenv("FRONTEND_URL", "https://frontend.test/app")

    application = create_app("testing")

    with application.app_context():
        db.create_all()

    yield application

    with application.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
