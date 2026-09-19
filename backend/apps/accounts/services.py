from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile


def get_access_lifetime() -> timedelta:
    return settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]


def get_refresh_lifetime() -> timedelta:
    return settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]


def set_auth_cookies(response, user):
    refresh = RefreshToken.for_user(user)
    response.set_cookie(
        settings.JWT_COOKIE_ACCESS,
        str(refresh.access_token),
        max_age=int(get_access_lifetime().total_seconds()),
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path=settings.JWT_COOKIE_PATH,
    )
    response.set_cookie(
        settings.JWT_COOKIE_REFRESH,
        str(refresh),
        max_age=int(get_refresh_lifetime().total_seconds()),
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path=settings.JWT_COOKIE_PATH,
    )
    return refresh


def clear_auth_cookies(response):
    for name in (settings.JWT_COOKIE_ACCESS, settings.JWT_COOKIE_REFRESH):
        response.delete_cookie(name, path=settings.JWT_COOKIE_PATH)
    return response


def get_or_create_profile(user) -> Profile:
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def send_email_safely(subject, message, to):
    """Envía un email sin bloquear el flujo si el SMTP falla."""
    try:
        from django.core.mail import send_mail

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [to])
    except Exception:
        import logging

        logging.getLogger("sebasyoga").exception("No se pudo enviar email a %s", to)


def record_activity(user, minutes=0, when=None):
    """Actualiza racha y minutos totales de un usuario. Devuelve el perfil."""
    from datetime import date

    when = when or timezone.localdate()
    profile = get_or_create_profile(user)
    profile.total_minutes += max(minutes, 0)

    if profile.last_active_date == when:
        profile.save(update_fields=["total_minutes"])
        return profile

    if profile.last_active_date == when - timedelta(days=1) or profile.streak_days == 0:
        profile.streak_days += 1
    else:
        profile.streak_days = 1

    profile.last_active_date = when
    profile.longest_streak = max(profile.longest_streak, profile.streak_days)
    profile.save(update_fields=["total_minutes", "streak_days", "last_active_date", "longest_streak"])
    return profile