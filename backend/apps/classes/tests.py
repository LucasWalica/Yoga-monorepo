import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.classes.models import ClassRequest, LiveClass
from apps.meditation.models import MeditationSession

pytestmark = pytest.mark.django_db


def make_live_class(**kwargs):
    defaults = {
        "title": "Vinyasa del mediodía",
        "youtube_url": "https://www.youtube.com/watch?v=abc123",
        "scheduled_start": timezone.now() + timezone.timedelta(hours=3),
        "duration_minutes": 60,
    }
    defaults.update(kwargs)
    return LiveClass.objects.create(**defaults)


def test_live_classes_list_public(api):
    make_live_class()
    resp = api.get("/api/classes/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["count"] == 1
    assert body["results"][0]["title"] == "Vinyasa del mediodía"


def test_live_classes_filters_past(api):
    make_live_class(scheduled_start=timezone.now() - timezone.timedelta(days=1))
    assert api.get("/api/classes/").json()["count"] == 0
    assert api.get("/api/classes/?past=1").json()["count"] == 1


def test_attend_class_requires_auth(api):
    cls = make_live_class()
    assert api.post(f"/api/classes/{cls.id}/attend/").status_code == 401


def test_attend_class_updates_stats(cookie_client):
    client, user = cookie_client
    cls = make_live_class(duration_minutes=60)
    resp = client.post(f"/api/classes/{cls.id}/attend/")
    assert resp.status_code == 201
    user.refresh_from_db()
    assert user.profile.streak_days == 1
    assert user.profile.total_minutes == 60
    # asistencia única
    resp2 = client.post(f"/api/classes/{cls.id}/attend/")
    assert resp2.status_code == 200


def test_attend_class_marks_detail(cookie_client):
    client, user = cookie_client
    cls = make_live_class()
    client.post(f"/api/classes/{cls.id}/attend/")
    resp = client.get(f"/api/classes/{cls.id}/")
    assert resp.json()["attended"] is True
    assert resp.json()["attendees_count"] == 1


def test_create_class_request(cookie_client):
    client, user = cookie_client
    resp = client.post(
        "/api/classes/requests/",
        {"class_type": "Yin", "preferred_time": "Noche", "message": "Me encantaría un Yin nocturno"},
        format="json",
    )
    assert resp.status_code == 201
    req = ClassRequest.objects.get(user=user)
    assert req.status == "pending"


def test_recorded_and_resources_public(api):
    resp = api.get("/api/classes/recorded/")
    assert resp.status_code == 200
    resp = api.get("/api/classes/resources/")
    assert resp.status_code == 200


def test_inactive_class_not_visible(api):
    cls = make_live_class()
    cls.is_active = False
    cls.save()
    assert api.get("/api/classes/").json()["count"] == 0
    assert api.get(f"/api/classes/{cls.id}/").status_code == 404


def test_attend_unauthenticated_404(api):
    assert api.post("/api/classes/99999/attend/").status_code == 401


def test_attend_nonexistent_class(cookie_client):
    client, _ = cookie_client
    assert client.post("/api/classes/99999/attend/").status_code == 404


def test_profile_classes_attended(cookie_client):
    client, user = cookie_client
    cls = make_live_class()
    client.post(f"/api/classes/{cls.id}/attend/")
    user.refresh_from_db()
    assert user.profile.classes_attended == 1


def test_attend_increments_attendees_count(cookie_client, user_factory):
    client, user = cookie_client
    cls = make_live_class()
    other = user_factory(email="otro@test.com")
    other_client = APIClient()
    other_client.force_authenticate(other)
    client.post(f"/api/classes/{cls.id}/attend/")
    other_client.post(f"/api/classes/{cls.id}/attend/")
    detail = client.get(f"/api/classes/{cls.id}/")
    assert detail.json()["attendees_count"] == 2


# --- Gamificación ligada a clases ---


def test_attend_unlocks_classes_1_and_first_step(cookie_client):
    from apps.gamification.models import UserAchievement

    client, user = cookie_client
    cls = make_live_class(duration_minutes=45)
    client.post(f"/api/classes/{cls.id}/attend/")
    user.refresh_from_db()
    codes = {
        ua.achievement.code for ua in UserAchievement.objects.filter(user=user)
    }
    assert "first_step" in codes
    assert "classes_1" in codes
    assert "classes_10" not in codes
    assert user.profile.total_minutes == 45


# --- Solicitudes de clases ---


def test_class_requests_require_auth(api):
    assert api.get("/api/classes/requests/").status_code == 401


def test_class_requests_only_own(cookie_client, user_factory):
    client, user = cookie_client
    client.post(
        "/api/classes/requests/",
        {"class_type": "Yin", "message": "Quiero una clase de yin"},
        format="json",
    )
    other = user_factory(email="otro@test.com")
    other.refresh_from_db()
    other_client = APIClient()
    other_client.force_authenticate(other)
    other_client.post(
        "/api/classes/requests/",
        {"class_type": "Hatha", "message": "Quiero hatha"},
        format="json",
    )
    resp = client.get("/api/classes/requests/")
    assert resp.status_code == 200
    assert resp.json()["count"] == 1
    assert resp.json()["results"][0]["class_type"] == "Yin"


def test_class_request_status_read_only(cookie_client):
    client, _ = cookie_client
    resp = client.post(
        "/api/classes/requests/",
        {"class_type": "Yin", "message": "Por favor", "status": "planned"},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"


# --- Detalle / orden ---


def test_live_class_detail_anonymous_attended_false(api):
    cls = make_live_class()
    body = api.get(f"/api/classes/{cls.id}/").json()
    assert body["attended"] is False
    assert body["attendees_count"] == 0
    assert body["level_display"] is not None


def test_live_classes_ordered_soonest_first(api):
    make_live_class(title="Más tarde", scheduled_start=timezone.now() + timezone.timedelta(hours=5))
    make_live_class(title="Antes", scheduled_start=timezone.now() + timezone.timedelta(hours=1))
    titles = [r["title"] for r in api.get("/api/classes/").json()["results"]]
    assert titles == ["Antes", "Más tarde"]