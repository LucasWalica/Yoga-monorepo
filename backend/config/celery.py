from datetime import timedelta
import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("sebasyoga")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    # Cada día a las 00:30 re-calculamos rachas de `Profile` por si hubo
    # días sin actividad que deban cortar la racha.
    "recalcular-rachas-diarias": {
        "task": "apps.gamification.tasks.recalcular_rachas",
        "schedule": crontab(hour=0, minute=30),
    },
}