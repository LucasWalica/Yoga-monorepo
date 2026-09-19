from django.conf import settings
from celery import shared_task
from django.utils import timezone


def run_inline() -> bool:
    """Determina si la tarea debe ejecutarse en línea (sin broker).

    True en desarrollo (DEBUG) o cuando CELERY_TASK_ALWAYS_EAGER=1.
    """
    import os

    if settings.DEBUG:
        return True
    eager = os.environ.get("CELERY_TASK_ALWAYS_EAGER", "").lower()
    return eager in {"1", "true", "yes", "on"}


def dispatch_record_activity(user_id, minutes=0, activity_type="meditation"):
    """Dispara la tarea de gamificación.

    Corre en línea si hay DEBUG o si se indica CELERY_TASK_ALWAYS_EAGER
    (típicamente local/tests). En producción siempre va con Celery.
    """
    if run_inline():
        record_activity_and_achievements.run(user_id, minutes, activity_type)
    else:
        record_activity_and_achievements.delay(user_id, minutes, activity_type)


@shared_task
def record_activity_and_achievements(user_id, minutes=0, activity_type="meditation"):
    """Actualiza racha/minutos del usuario y evalúa logros.

    Llamado (vía Celery) después de registrar una asistencia o completar
    una sesión de meditación/pomodoro.
    """
    from django.contrib.auth import get_user_model

    from apps.accounts.services import record_activity
    from .services import unlock_for

    user = get_user_model().objects.filter(pk=user_id, is_active=True).first()
    if user is None:
        return None

    record_activity(user, minutes=minutes)
    newly = unlock_for(user)
    return {
        "user": user.email,
        "minutes": minutes,
        "activity_type": activity_type,
        "new_achievements": [a.code for a in newly],
    }


@shared_task
def recalcular_rachas():
    """Tarea diaria (celery beat): corta las rachas de quienes no se
    conectaron durante la jornada de ayer."""
    from django.contrib.auth import get_user_model

    from apps.accounts.models import Profile

    yesterday = timezone.localdate() - timezone.timedelta(days=1)
    broken = 0
    for profile in Profile.objects.filter(
        streak_days__gt=0
    ).select_related("user"):
        if profile.last_active_date != yesterday:
            profile.streak_days = 0
            profile.save(update_fields=["streak_days"])
            broken += 1
    return {"rachas_cortadas": broken}