from http import HTTPStatus

from backend.models import User


def initiate_login(client):
    response = client.get("/api/login/google", follow_redirects=False)
    assert response.status_code in {HTTPStatus.FOUND, HTTPStatus.SEE_OTHER}
    with client.session_transaction() as session:
        assert session.get("google_oauth_state") == "stub-state"
    return response


def complete_callback(client, google_stub, user_payload):
    google_stub.user_info = user_payload
    response = client.get(
        "/api/login/google/callback",
        query_string={"code": "stub-code", "state": "stub-state"},
        follow_redirects=False,
    )
    return response


def test_google_login_creates_user_with_id_field(client, google_stub):
    initiate_login(client)
    response = complete_callback(
        client,
        google_stub,
        {
            "id": "user-123",
            "email": "user@example.com",
            "name": "Test User",
            "picture": "https://example.com/avatar.png",
        },
    )

    assert response.status_code == HTTPStatus.FOUND
    assert response.headers["Location"] == "https://frontend.test/app"

    with client.session_transaction() as session:
        assert session.get("user_id") is not None
        assert session.get("user_info", {}).get("email") == "user@example.com"

    with client.application.app_context():
        stored = User.query.filter_by(email="user@example.com").first()
        assert stored is not None
        assert stored.google_id == "user-123"


def test_google_login_accepts_sub_field(client, google_stub):
    initiate_login(client)
    response = complete_callback(
        client,
        google_stub,
        {
            "sub": "sub-456",
            "email": "sub-user@example.com",
            "name": "Sub User",
            "picture": "https://example.com/sub.png",
        },
    )

    assert response.status_code == HTTPStatus.FOUND
    assert response.headers["Location"] == "https://frontend.test/app"

    with client.session_transaction() as session:
        assert session.get("user_info", {}).get("email") == "sub-user@example.com"
        assert session.get("user_info", {}).get("id") == "sub-456"

    with client.application.app_context():
        stored = User.query.filter_by(email="sub-user@example.com").first()
        assert stored is not None
        assert stored.google_id == "sub-456"
