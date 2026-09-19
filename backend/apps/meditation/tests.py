import pytest

from apps.meditation.models import MeditationSession

pytestmark = pytest.mark.django_db


def test_create_meditation_session_updates_profile(cookie_client):
    client, user = cookie_client
    resp = client.post(
        "/api/meditation/sessions/",
        {"minutes": 15, "session_type": "meditation"},
        format="json",
    )
    assert resp.status_code == 201
    assert MeditationSession.objects.filter(user=user, minutes=15).exists()
    user.refresh_from_db()
    assert user.profile.total_minutes == 15
    assert user.profile.streak_days == 1


def test_validate_minutes_range(cookie_client):
    client, _ = cookie_client
    assert (
        client.post(
            "/api/meditation/sessions/",
            {"minutes": 0, "session_type": "meditation"},
            format="json",
        ).status_code
        == 400
    )


def test_audio_guides_public(api):
    resp = api.get("/api/meditation/audios/")
    assert resp.status_code == 200


def test_session_list_only_mine(cookie_client, user_factory):
    client, user = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 5, "session_type": "pomodoro"},
        format="json",
    )
    other = user_factory(email="otro@test.com")
    other.refresh_from_db()
    assert client.get("/api/meditation/sessions/mine/").json()["count"] == 1


# --- Validaciones de sesión ---


def test_session_create_requires_auth(api):
    assert (
        api.post(
            "/api/meditation/sessions/",
            {"minutes": 5, "session_type": "meditation"},
            format="json",
        ).status_code
        == 401
    )


def test_minutes_upper_bound(cookie_client):
    client, _ = cookie_client
    ok = client.post(
        "/api/meditation/sessions/",
        {"minutes": 600, "session_type": "meditation"},
        format="json",
    )
    assert ok.status_code == 201
    bad = client.post(
        "/api/meditation/sessions/",
        {"minutes": 601, "session_type": "meditation"},
        format="json",
    )
    assert bad.status_code == 400


def test_invalid_session_type(cookie_client):
    client, _ = cookie_client
    resp = client.post(
        "/api/meditation/sessions/",
        {"minutes": 5, "session_type": "karate"},
        format="json",
    )
    assert resp.status_code == 400


def test_breathing_session_counts_as_session(cookie_client):
    client, user = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 7, "session_type": "breathing"},
        format="json",
    )
    stats = client.get("/api/gamification/stats/").json()
    assert stats["total_sessions"] == 1
    assert stats["meditations"] == 0
    assert stats["total_minutes"] == 7


# --- Audios ---


def test_audio_guides_only_active_and_resolved_url(api):
    from apps.meditation.models import AudioGuide

    AudioGuide.objects.create(title="activo", url="https://x.com/a.mp3", duration_minutes=10)
    AudioGuide.objects.create(title="inactivo", url="https://x.com/b.mp3", is_active=False)
    body = api.get("/api/meditation/audios/").json()
    assert [g["title"] for g in body["results"]] == ["activo"]
    assert body["results"][0]["resolved_url"] == "https://x.com/a.mp3"


def test_audio_guide_with_file_url(api):
    from apps.meditation.models import AudioGuide

    g = AudioGuide.objects.create(title="sonido", file="audio/playa.mp3", duration_minutes=20)
    body = api.get("/api/meditation/audios/").json()
    res = body["results"][0]
    assert res["title"] == "sonido"
    assert res["resolved_url"] == g.file.url
    assert res["duration_minutes"] == 20