from django.conf import settings
from django.db import models


class AudioGuide(models.Model):
    """Audio de meditación o sonido ambiental para la práctica."""

    class Category(models.TextChoices):
        NATURE = "nature", "Sonidos de la naturaleza"
        BREATHING = "breathing", "Respiración guiada"
        BODY_SCAN = "body_scan", "Escaneo corporal"
        AMBIENT = "ambient", "Ambiente relajante"
        MEDITATION = "meditation", "Meditación guiada"

    title = models.CharField("título", max_length=200)
    description = models.TextField("descripción", blank=True)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.AMBIENT
    )
    url = models.URLField("enlace del audio", blank=True)
    file = models.FileField("archivo de audio", upload_to="audio/", blank=True)
    duration_minutes = models.PositiveIntegerField("duración (minutos)", default=10)
    is_active = models.BooleanField("visible", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "audio"
        verbose_name_plural = "audios"
        ordering = ["category", "title"]

    def __str__(self):
        return self.title

    @property
    def resolved_url(self):
        if self.url:
            return self.url
        if self.file:
            return self.file.url
        return ""


class MeditationSession(models.Model):
    """Registro de una sesión de meditación o pomodoro completada."""

    class Type(models.TextChoices):
        MEDITATION = "meditation", "Meditación"
        POMODORO = "pomodoro", "Pomodoro de enfoque"
        BREATHING = "breathing", "Respiración"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meditation_sessions"
    )
    minutes = models.PositiveIntegerField("minutos", default=1)
    session_type = models.CharField(
        max_length=20, choices=Type.choices, default=Type.MEDITATION
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "sesión de meditación"
        verbose_name_plural = "sesiones de meditación"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.session_type} {self.minutes}min"