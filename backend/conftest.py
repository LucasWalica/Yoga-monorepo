import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ.setdefault("CELERY_TASK_ALWAYS_EAGER", "1")

import django  # noqa: E402

django.setup()

import pytest  # noqa: E402
from rest_framework.test import APIClient  # noqa: E402

from apps.accounts.models import Profile, User  # noqa: E402

PASSWORD = "clave-segura-123"


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def user_factory():
    created = []

    def _make(email="alumno@test.com", full_name="Alumno Test", active=True):
        user = User.objects.create_user(
            email=email, password=PASSWORD, full_name=full_name
        )
        user.is_active = active
        user.save()
        Profile.objects.create(user=user)
        created.append(user)
        return user

    yield _make
    for u in created:
        User.objects.filter(pk=u.pk).delete()


@pytest.fixture
def auth_api(user_factory):
    user = user_factory()
    client = APIClient()
    assert client.login(username=user.email, password=PASSWORD)
    client.force_authenticate(user=user)
    return client, user


@pytest.fixture
def cookie_client(user_factory):
    """Cliente que inicia sesión vía endpoint (mantiene cookies httpOnly)."""
    user = user_factory()
    client = APIClient()
    resp = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": PASSWORD},
        format="json",
    )
    assert resp.status_code == 200, resp.data
    return client, user