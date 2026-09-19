import pytest

from apps.gamification.models import Achievement, UserAchievement
from apps.gamification.services import compute_stats, unlock_for

pytestmark = pytest.mark.django_db


def test_achievements_seeded():
    assert Achievement.objects.count() == 13


def test_first_step_unlocks_on_first_activity(cookie_client):
    client, user = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 10, "session_type": "meditation"},
        format="json",
    )
    assert Achievement.objects.get(code="first_step") in [
        ua.achievement for ua in UserAchievement.objects.filter(user=user)
    ]


def test_stats_endpoint(cookie_client):
    client, user = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 30, "session_type": "pomodoro"},
        format="json",
    )
    resp = client.get("/api/gamification/stats/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_minutes"] == 30
    assert data["pomodoros"] == 1
    assert data["achievements_total"] == 13


def test_achievements_unlocked_flag(cookie_client):
    client, user = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 10, "session_type": "meditation"},
        format="json",
    )
    resp = client.get("/api/gamification/achievements/")
    by_code = {a["code"]: a for a in resp.json()["results"]}
    assert by_code["first_step"]["unlocked"] is True
    assert by_code["minutes_1000"]["unlocked"] is False
    assert resp.status_code == 200


def test_recalcular_rachas_corta():
    from datetime import timedelta

    from django.contrib.auth import get_user_model
    from django.utils import timezone

    from apps.accounts.models import Profile
    from apps.gamification.tasks import recalcular_rachas

    User = get_user_model()
    user = User.objects.create_user(email="racha@test.com", password="clave-segura-123")
    profile = Profile.objects.create(user=user, streak_days=5)
    profile.last_active_date = timezone.localdate() - timedelta(days=3)
    profile.save()
    result = recalcular_rachas()
    assert result["rachas_cortadas"] == 1
    profile.refresh_from_db()
    assert profile.streak_days == 0


def test_unlock_for_grants_accumulated(cookie_client):
    """Desbloquea logros de minutos acumulados incluso con profile cacheado."""
    from apps.accounts.services import record_activity
    from apps.gamification.services import unlock_for

    client, user = cookie_client
    user.profile.total_minutes  # fuerza cache del profile antes de acumular
    for _ in range(21):
        record_activity(user, minutes=60)
    unlock_for(user)
    user.refresh_from_db()
    assert user.profile.total_minutes >= 1260
    codes = {ua.achievement.code for ua in user.achievements.all()}
    assert "classes_10" not in codes
    assert "minutes_1000" in codes
    assert "minutes_60" in codes


def test_meditation_and_pomodoro_achievements(cookie_client):
    from apps.gamification.services import unlock_for

    client, user = cookie_client
    for _ in range(5):
        client.post(
            "/api/meditation/sessions/",
            {"minutes": 10, "session_type": "meditation"},
            format="json",
        )
    for _ in range(10):
        client.post(
            "/api/meditation/sessions/",
            {"minutes": 25, "session_type": "pomodoro"},
            format="json",
        )
    unlock_for(user)
    codes = {ua.achievement.code for ua in user.achievements.all()}
    assert "meditation_5" in codes
    assert "pomodoro_10" in codes


# --- Auth del módulo ---


def test_stats_requires_auth(api):
    assert api.get("/api/gamification/stats/").status_code == 401


def test_achievements_requires_auth(api):
    assert api.get("/api/gamification/achievements/").status_code == 401


def test_stats_has_all_counters(cookie_client):
    client, _ = cookie_client
    resp = client.get("/api/gamification/stats/")
    data = resp.json()
    for key in (
        "total_minutes",
        "streak_days",
        "classes_attended",
        "meditations",
        "pomodoros",
        "total_sessions",
        "achievements_unlocked",
        "achievements_total",
        "minutes_last_7_days",
    ):
        assert key in data
    assert data["achievements_total"] == 13


# --- Ventana de 7 días y backdating ---


def test_stats_week_minutes_counts_only_recent(cookie_client):
    from django.utils import timezone

    from apps.meditation.models import MeditationSession

    client, user = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 10, "session_type": "pomodoro"},
        format="json",
    )
    old = MeditationSession.objects.get(user=user)
    MeditationSession.objects.filter(pk=old.pk).update(
        created_at=timezone.now() - timezone.timedelta(days=10)
    )
    data = client.get("/api/gamification/stats/").json()
    assert data["total_minutes"] == 10
    assert data["minutes_last_7_days"] == 0


def test_stats_week_minutes_suma_recientes(cookie_client):
    client, _ = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 30, "session_type": "meditation"},
        format="json",
    )
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 15, "session_type": "pomodoro"},
        format="json",
    )
    data = client.get("/api/gamification/stats/").json()
    assert data["minutes_last_7_days"] == 45


# --- Rachas ---


def test_streak_3_unlocks_award(cookie_client):
    from datetime import timedelta

    from django.utils import timezone

    from apps.accounts.services import record_activity

    client, user = cookie_client
    today = timezone.localdate()
    record_activity(user, minutes=5, when=today - timedelta(days=2))
    record_activity(user, minutes=5, when=today - timedelta(days=1))
    record_activity(user, minutes=5, when=today)
    unlock_for(user)
    user.refresh_from_db()
    codes = {ua.achievement.code for ua in user.achievements.all()}
    assert "streak_3" in codes
    assert "streak_7" not in codes
    assert user.profile.longest_streak == 3


# --- Idempotencia ---


def test_unlock_for_idempotent(cookie_client):
    for _ in range(3):
        cookie_client[0].post(
            "/api/meditation/sessions/",
            {"minutes": 10, "session_type": "meditation"},
            format="json",
        )
    unlock_for(cookie_client[1])
    first = UserAchievement.objects.filter(user=cookie_client[1]).count()
    unlock_for(cookie_client[1])
    assert UserAchievement.objects.filter(user=cookie_client[1]).count() == first


def test_achievements_unlocked_at_present(cookie_client):
    client, _ = cookie_client
    client.post(
        "/api/meditation/sessions/",
        {"minutes": 10, "session_type": "meditation"},
        format="json",
    )
    body = client.get("/api/gamification/achievements/").json()
    by_code = {a["code"]: a for a in body["results"]}
    assert by_code["first_step"]["unlocked"] is True
    assert by_code["first_step"]["unlocked_at"] is not None
    assert by_code["minutes_60"]["unlocked"] is False