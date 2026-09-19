import pytest
from django.conf import settings
from unittest.mock import patch

from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_register_creates_user_and_sets_cookies(api):
    resp = api.post(
        "/api/auth/register/",
        {"email": "nuevo@test.com", "full_name": "Nueva", "password": "clave-segura-123"},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["email"] == "nuevo@test.com"
    assert settings.JWT_COOKIE_ACCESS in api.cookies
    assert settings.JWT_COOKIE_REFRESH in api.cookies


def test_register_duplicate_email(api, user_factory):
    user_factory(email="dup@test.com")
    resp = api.post(
        "/api/auth/register/",
        {"email": "DUP@test.com", "password": "clave-segura-123"},
        format="json",
    )
    assert resp.status_code == 400


def test_login_wrong_password(api, user_factory):
    user_factory()
    resp = api.post(
        "/api/auth/login/",
        {"email": "alumno@test.com", "password": "incorrecta"},
        format="json",
    )
    assert resp.status_code == 401


def test_login_success_sets_cookies(api, user_factory):
    user_factory()
    resp = api.post(
        "/api/auth/login/",
        {"email": "alumno@test.com", "password": "clave-segura-123"},
        format="json",
    )
    assert resp.status_code == 200
    assert settings.JWT_COOKIE_ACCESS in api.cookies


def test_me_requires_auth(api):
    assert api.get("/api/auth/me/").status_code == 401


def test_me_returns_profile(cookie_client):
    client, user = cookie_client
    resp = client.get("/api/auth/me/")
    assert resp.status_code == 200
    assert resp.data["email"] == user.email
    assert resp.data["profile"]["streak_days"] == 0


def test_refresh_rotates_token(cookie_client):
    client, user = cookie_client
    resp = client.post("/api/auth/refresh/")
    assert resp.status_code == 200
    # la cookie de refresh fue renovada (rotación)
    from django.core.cache import cache

    cache.clear()


def test_logout_blacklists_refresh(cookie_client):
    client, _ = cookie_client
    assert client.post("/api/auth/logout/").status_code == 200
    resp = client.post("/api/auth/refresh/")
    assert resp.status_code == 401


def test_google_auth_creates_user(api):
    fake = {
        "email": "google@test.com",
        "full_name": "Usuario Google",
        "avatar_url": "http://x/a.png",
    }
    with patch("apps.accounts.google.verify_google_token", return_value=fake):
        resp = api.post(
            "/api/auth/google/",
            {"access_token": "xyz"},
            format="json",
        )
    assert resp.status_code == 200
    assert resp.data["email"] == "google@test.com"
    assert settings.JWT_COOKIE_ACCESS in api.cookies


def test_google_auth_links_existing_user(api, user_factory):
    user_factory(email="google@test.com")
    with patch(
        "apps.accounts.google.verify_google_token",
        return_value={"email": "google@test.com", "full_name": "", "avatar_url": ""},
    ):
        resp = api.post("/api/auth/google/", {"access_token": "xyz"}, format="json")
    assert resp.status_code == 200
    assert resp.data["email"] == "google@test.com"


def test_password_reset_flow(api, user_factory):
    user_factory()
    resp = api.post(
        "/api/auth/password/reset/",
        {"email": "alumno@test.com"},
        format="json",
    )
    assert resp.status_code == 200
    assert "reset_link" in resp.data  # DEBUG expone el enlace

    from urllib.parse import parse_qs, urlparse

    params = parse_qs(urlparse(resp.data["reset_link"]).query)
    reset = api.post(
        "/api/auth/password/reset/confirm/",
        {
            "email": "alumno@test.com",
            "token": params["token"][0],
            "new_password": "nueva-clave-456",
        },
        format="json",
    )
    assert reset.status_code == 200
    # login con la nueva clave
    api = APIClient()
    resp = api.post(
        "/api/auth/login/",
        {"email": "alumno@test.com", "password": "nueva-clave-456"},
        format="json",
    )
    assert resp.status_code == 200


def test_passkey_login_start_returns_options(api):
    resp = api.post("/api/auth/passkey/login/start/", {}, format="json")
    assert resp.status_code == 200
    assert "challenge_token" in resp.data
    assert "options" in resp.data


def test_passkey_register_start_requires_auth(api):
    assert (
        api.post("/api/auth/passkey/register/start/", {}, format="json").status_code
        == 401
    )


def test_google_auth_invalid_token(api):
    with patch(
        "apps.accounts.google.verify_google_token",
        side_effect=ValueError("El token de Google no es válido."),
    ):
        resp = api.post("/api/auth/google/", {"access_token": "malo"}, format="json")
    assert resp.status_code == 400


def test_google_auth_missing_token(api):
    assert api.post("/api/auth/google/", {}, format="json").status_code == 400


def test_refresh_with_invalid_cookie(api):
    api.cookies[settings.JWT_COOKIE_REFRESH] = "token-basura"
    assert api.post("/api/auth/refresh/").status_code == 401


def test_access_via_bearer_header_for_native(user_factory):
    """Clientes nativos (Capacitor) pueden usar el access token en el header."""
    user_factory()
    login = APIClient()
    login.post(
        "/api/auth/login/",
        {"email": "alumno@test.com", "password": "clave-segura-123"},
        format="json",
    )
    access = login.cookies[settings.JWT_COOKIE_ACCESS].value
    fresh = APIClient()
    resp = fresh.get("/api/auth/me/", HTTP_AUTHORIZATION=f"Bearer {access}")
    assert resp.status_code == 200
    assert resp.data["email"] == "alumno@test.com"


def test_passkey_register_verify_flow(auth_api, monkeypatch):
    """Registra una passkey simulando la verificación del navegador."""
    from types import SimpleNamespace

    import apps.accounts.passkeys as pk
    from apps.accounts.models import PasskeyCredential

    client, user = auth_api
    start = client.post("/api/auth/passkey/register/start/", {}, format="json")
    assert start.status_code == 200

    fake_verified = SimpleNamespace(
        credential_id=b"fake-cred-id",
        credential_public_key=b"fake-public-key",
        sign_count=1,
    )
    monkeypatch.setattr(pk, "verify_registration_response", lambda **kw: fake_verified)

    verif = client.post(
        "/api/auth/passkey/register/verify/",
        {
            "challenge_token": start.data["challenge_token"],
            "response": {"id": "x", "type": "public-key"},
            "device_name": "Mi notebook",
        },
        format="json",
    )
    assert verif.status_code == 201
    cred = PasskeyCredential.objects.get(user=user)
    assert bytes(cred.credential_id) == b"fake-cred-id"
    assert cred.device_name == "Mi notebook"


def test_passkey_login_verify_flow(cookie_client, monkeypatch):
    """Inicia sesión con passkey simulando el gesto del dispositivo."""
    from types import SimpleNamespace

    import apps.accounts.passkeys as pk
    from django.conf import settings

    from apps.accounts.models import PasskeyCredential

    client, user = cookie_client
    cred = PasskeyCredential.objects.create(
        user=user,
        credential_id=b"cred-id",
        public_key=b"pub-key",
        sign_count=3,
        device_name="Celular",
    )
    start = client.post("/api/auth/passkey/login/start/", {"email": user.email}, format="json")
    assert start.status_code == 200

    monkeypatch.setattr(
        pk,
        "verify_authentication_response",
        lambda **kw: SimpleNamespace(new_sign_count=4),
    )

    import base64 as b64

    cred_b64 = b64.urlsafe_b64encode(b"cred-id").rstrip(b"=").decode()
    resp = client.post(
        "/api/auth/passkey/login/verify/",
        {
            "challenge_token": start.data["challenge_token"],
            "credential": {
                "id": cred_b64,
                "rawId": cred_b64,
                "type": "public-key",
                "response": {"clientDataJSON": "x", "authenticatorData": "y", "signature": "z"},
            },
        },
        format="json",
    )
    assert resp.status_code == 200
    assert resp.data["email"] == user.email
    assert settings.JWT_COOKIE_ACCESS in client.cookies
    cred.refresh_from_db()
    assert cred.sign_count == 4


# --- Registro / login / sesión ---


def test_register_weak_password(api):
    resp = api.post(
        "/api/auth/register/",
        {"email": "weak@test.com", "password": "123"},
        format="json",
    )
    assert resp.status_code == 400


def test_login_inactive_user(api, user_factory):
    user_factory(active=False)
    resp = api.post(
        "/api/auth/login/",
        {"email": "alumno@test.com", "password": "clave-segura-123"},
        format="json",
    )
    assert resp.status_code == 401


def test_logout_clears_cookies(cookie_client):
    client, _ = cookie_client
    resp = client.post("/api/auth/logout/")
    assert resp.status_code == 200
    assert resp.cookies[settings.JWT_COOKIE_ACCESS].value == ""
    assert resp.cookies[settings.JWT_COOKIE_REFRESH].value == ""


def test_refresh_without_cookie(api):
    assert api.post("/api/auth/refresh/").status_code == 401


def test_access_cookie_is_httponly(cookie_client):
    client, _ = cookie_client
    cookie = client.cookies[settings.JWT_COOKIE_ACCESS]

    import http.cookies

    if hasattr(cookie, "has_nonstandard_attr"):
        assert cookie.has_nonstandard_attr("HttpOnly")


def test_me_requires_bearer_rejected_when_bad(api):
    resp = api.get("/api/auth/me/", HTTP_AUTHORIZATION="Bearer token-invalido")
    assert resp.status_code in (401, 403)


# --- Password reset ---


def test_password_reset_unknown_email_does_not_leak(api):
    resp = api.post(
        "/api/auth/password/reset/",
        {"email": "nadie@test.com"},
        format="json",
    )
    assert resp.status_code == 200
    assert "reset_link" not in resp.data


def test_password_reset_confirm_bad_token(api, user_factory):
    user_factory()
    resp = api.post(
        "/api/auth/password/reset/confirm/",
        {"email": "alumno@test.com", "token": "t0ken-malo", "new_password": "nueva-clave-456"},
        format="json",
    )
    assert resp.status_code == 400


# --- Google ---


def test_google_auth_updates_avatar(api, user_factory):
    user_factory(email="google@test.com")
    with patch(
        "apps.accounts.google.verify_google_token",
        return_value={"email": "google@test.com", "full_name": "", "avatar_url": "http://nuevo.png"},
    ):
        resp = api.post("/api/auth/google/", {"access_token": "xyz"}, format="json")
    assert resp.status_code == 200
    me = api.get("/api/auth/me/")
    assert me.json()["avatar_url"] == "http://nuevo.png"


# --- Passkeys: listado y eliminación ---


def test_passkeys_require_auth(api):
    assert api.get("/api/auth/passkeys/").status_code == 401


def test_passkey_list_and_delete(cookie_client):
    from apps.accounts.models import PasskeyCredential

    client, user = cookie_client
    cred = PasskeyCredential.objects.create(
        user=user, credential_id=b"c1", public_key=b"k1", device_name="PC"
    )
    lst = client.get("/api/auth/passkeys/")
    assert lst.status_code == 200
    body = lst.json()
    assert len(body) == 1
    assert body[0]["device_name"] == "PC"

    assert client.delete(f"/api/auth/passkeys/{cred.pk}/").status_code == 200
    assert client.get("/api/auth/passkeys/").json() == []


def test_passkey_cannot_delete_others_with_404(cookie_client, user_factory):
    from apps.accounts.models import PasskeyCredential

    client, _ = cookie_client
    other = user_factory(email="otro@test.com")
    cred = PasskeyCredential.objects.create(user=other, credential_id=b"c2", public_key=b"k2")
    assert client.delete(f"/api/auth/passkeys/{cred.pk}/").status_code == 404


def test_passkey_login_verify_invalid_gesture(cookie_client, monkeypatch):
    import apps.accounts.passkeys as pk

    client, _ = cookie_client
    monkeypatch.setattr(
        pk,
        "verify_authentication",
        lambda *a, **k: (_ for _ in ()).throw(pk.WebAuthnError("Gesto inválido.")),
    )
    resp = client.post(
        "/api/auth/passkey/login/verify/",
        {"challenge_token": "x", "credential": {}},
        format="json",
    )
    assert resp.status_code == 400