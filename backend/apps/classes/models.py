from django.conf import settings
from django.db import models


class Nivel(models.TextChoices):
    TODOS = "todos", "Todos los niveles"
    PRINCIPIANTE = "principiante", "Principiante"
    INTERMEDIO = "intermedio", "Intermedio"
    AVANZADO = "avanzado", "Avanzado"


class LiveClass(models.Model):
    """Clase en directo (streaming externo, p. ej. YouTube)."""

    title = models.CharField("título", max_length=200)
    description = models.TextField("descripción", blank=True)
    youtube_url = models.URLField(
        "link del streaming (YouTube)",
        help_text="Pegá el link de YouTube de la transmisión en vivo. Se mostrará embebida en la app.",
    )
    scheduled_start = models.DateTimeField("fecha y hora")
    duration_minutes = models.PositiveIntegerField("duración (minutos)", default=60)
    level = models.CharField("nivel", max_length=20, choices=Nivel.choices, default=Nivel.TODOS)
    capacity = models.PositiveIntegerField("cupo máximo", default=0, help_text="0 = sin límite.")
    is_active = models.BooleanField("activa", default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_classes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "clase en vivo"
        verbose_name_plural = "clases en vivo"
        ordering = ["scheduled_start"]

    def __str__(self):
        return f"{self.title} ({self.scheduled_start:%d/%m %H:%M})"


class RecordedClass(models.Model):
    """Clase grabada disponible bajo demanda (YouTube/enlace externo)."""

    title = models.CharField("título", max_length=200)
    description = models.TextField("descripción", blank=True)
    youtube_url = models.URLField("link del vídeo (YouTube)")
    thumbnail_url = models.URLField("imagen de portada", blank=True)
    duration_minutes = models.PositiveIntegerField("duración (minutos)", default=30)
    level = models.CharField("nivel", max_length=20, choices=Nivel.choices, default=Nivel.TODOS)
    is_active = models.BooleanField("visible", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "clase grabada"
        verbose_name_plural = "clases grabadas"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Attendance(models.Model):
    """Asistencia de un usuario a una clase en vivo."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    live_class = models.ForeignKey(LiveClass, on_delete=models.CASCADE, related_name="attendances")
    attended_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "asistencia"
        verbose_name_plural = "asistencias"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "live_class"], name="unique_attendance_user_class"
            )
        ]

    def __str__(self):
        return f"{self.user} → {self.live_class}"


class ClassRequest(models.Model):
    """Pedido de un alumno: tema / horario / clase que le gustaría."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PLANNED = "planned", "Planificada"
        DECLINED = "declined", "Descartada"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="class_requests")
    class_type = models.CharField(
        "tipo de clase", max_length=50, blank=True,
        help_text="Ej: Vinyasa, Hatha, Yin…",
    )
    preferred_time = models.CharField("horario preferido", max_length=100, blank=True)
    message = models.TextField("mensaje", help_text="Contá qué te gustaría practicar o en qué horario.")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    admin_note = models.TextField("respuesta del profe", blank=True, help_text="Respuesta visible para el alumno.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "solicitud de clase"
        verbose_name_plural = "solicitudes de clases"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.class_type or 'sin tipo'}"


class Resource(models.Model):
    """Recurso de la biblioteca: PDF, audio o vídeo."""

    class Kind(models.TextChoices):
        PDF = "pdf", "PDF"
        AUDIO = "audio", "Audio"
        VIDEO = "video", "Vídeo"

    title = models.CharField("título", max_length=200)
    description = models.TextField("descripción", blank=True)
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.PDF)
    url = models.URLField("enlace del recurso", blank=True)
    file = models.FileField("archivo", upload_to="resources/", blank=True)
    is_active = models.BooleanField("visible", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "recurso"
        verbose_name_plural = "recursos"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def resolved_url(self):
        if self.url:
            return self.url
        if self.file:
            return self.file.url
        return ""