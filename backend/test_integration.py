"""Tests de integración: schema OpenAPI, docs y panel de admin."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.accounts.models import Profile

pytestmark = pytest.mark.django_db


def _staff_client():
    User = get_user_model()
    user = User.objects.create_user(
        email="seba@admin.com", password="clave-segura-123", full_name="Seba"
    )
    user.is_staff = True
    user.save()
    Profile.objects.create(user=user)
    client = APIClient()
    assert client.login(username=user.email, password="clave-segura-123")
    return client, user


def _seed_live_class():
    from django.utils import timezone

    from apps.classes.models import LiveClass

    return LiveClass.objects.create(
        title="Vinyasa en vivo",
        youtube_url="https://www.youtube.com/watch?v=abc123",
        scheduled_start=timezone.now() + timezone.timedelta(hours=2),
        duration_minutes=60,
    )


def test_openapi_schema_generates(api):
    """Generar el schema valida que todos los serializers/views sean OK."""
    resp = api.get("/api/schema/", HTTP_ACCEPT="application/json")
    assert resp.status_code == 200
    assert "paths" in resp.json()


def test_swagger_docs_available(api):
    assert api.get("/api/docs/").status_code == 200


def test_redoc_available(api):
    assert api.get("/api/redoc/").status_code == 200


def test_admin_login_page(api):
    assert api.get("/admin/login/").status_code == 200


def test_admin_dashboard_requires_staff(api):
    assert api.get("/admin/").status_code == 302


def test_admin_dashboard_renders_for_staff(api):
    _seed_live_class()
    client, _ = _staff_client()
    resp = client.get("/admin/")
    assert resp.status_code == 200
    content = resp.content.decode()
    assert "Seba Yoga" in content
    assert "Próximas clases en vivo" in content
    assert "Vinyasa en vivo" in content


def test_admin_dashboard_shows_counters(api):
    client, _ = _staff_client()
    resp = client.get("/admin/")
    content = resp.content.decode()
    assert "Usuarios activos hoy" in content
    assert "Solicitudes pendientes" in content