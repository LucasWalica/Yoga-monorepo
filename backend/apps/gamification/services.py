from django.db import IntegrityError, transaction

from .models import Achievement, UserAchievement

CONDITIONS = {
    "first_step": lambda s: s["total_sessions"] >= 1 or s["classes_attended"] >= 1,
    "classes_1": lambda s: s["classes_attended"] >= 1,
    "classes_10": lambda s: s["classes_attended"] >= 10,
    "warrior_20": lambda s: s["classes_attended"] >= 20,
    "meditation_5": lambda s: s["meditations"] >= 5,
    "pomodoro_10": lambda s: s["pomodoros"] >= 10,
    "streak_3": lambda s: s["streak_days"] >= 3,
    "streak_7": lambda s: s["streak_days"] >= 7,
    "streak_14": lambda s: s["streak_days"] >= 14,
    "streak_30": lambda s: s["streak_days"] >= 30,
    "minutes_60": lambda s: s["total_minutes"] >= 60,
    "minutes_300": lambda s: s["total_minutes"] >= 300,
    "minutes_1000": lambda s: s["total_minutes"] >= 1000,
}


def compute_stats(user):
    from apps.accounts.models import Profile
    from apps.meditation.models import MeditationSession

    profile = Profile.objects.get(user=user)
    sessions = MeditationSession.objects.filter(user=user)
    return {
        "total_minutes": profile.total_minutes,
        "streak_days": profile.streak_days,
        "classes_attended": profile.classes_attended,
        "meditations": sessions.filter(session_type="meditation").count(),
        "pomodoros": sessions.filter(session_type="pomodoro").count(),
        "total_sessions": sessions.count(),
    }


@transaction.atomic
def unlock_for(user):
    """Evalúa todas las condiciones y desbloquea los logros nuevos.

    Devuelve la lista de logros recién desbloqueados.
    """
    stats = compute_stats(user)
    unlocked_codes = set(
        UserAchievement.objects.filter(user=user).values_list(
            "achievement__code", flat=True
        )
    )
    newly = []
    for achievement in Achievement.objects.all().order_by("order"):
        if achievement.code in unlocked_codes:
            continue
        condition = CONDITIONS.get(achievement.code)
        if condition and condition(stats):
            try:
                with transaction.atomic():
                    UserAchievement.objects.create(
                        user=user, achievement=achievement
                    )
                newly.append(achievement)
            except IntegrityError:
                pass
    return newly