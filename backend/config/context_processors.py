from django.contrib.auth import get_user_model
from django.db.models import Sum

from apps.classes.models import Attendance, ClassRequest, LiveClass
from apps.meditation.models import MeditationSession


def seba_dashboard(request):
    """Estadísticas para el dashboard del admin (solo en /admin y logueado)."""
    if not request.user.is_authenticated or not request.path.startswith("/admin"):
        return {}
    from django.utils import timezone

    start_of_today = timezone.localtime().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    end_of_today = start_of_today + timezone.timedelta(days=1)

    counters = [
        {
            "label": "Usuarios activos hoy",
            "value": get_user_model()
            .objects.filter(last_login__gte=start_of_today)
            .count(),
        },
        {
            "label": "Minutos meditados hoy",
            "value": MeditationSession.objects.filter(
                created_at__gte=start_of_today
            ).aggregate(t=Sum("minutes"))["t"]
            or 0,
        },
        {
            "label": "Asistencias de hoy",
            "value": Attendance.objects.filter(
                attended_at__gte=start_of_today, attended_at__lt=end_of_today
            ).count(),
        },
        {
            "label": "Solicitudes pendientes",
            "value": ClassRequest.objects.filter(status="pending").count(),
        },
    ]
    return {
        "dashboard_counters": counters,
        "dashboard_next_classes": LiveClass.objects.filter(
            is_active=True, scheduled_start__gte=timezone.now()
        ).order_by("scheduled_start")[:5],
    }