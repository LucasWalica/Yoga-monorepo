from django.conf import settings
from django.db import models


class Achievement(models.Model):
    """Insignia que se desbloquea al cumplir condiciones."""

    code = models.SlugField(unique=True)
    title = models.CharField("título", max_length=120)
    description = models.CharField("descripción", max_length=300)
    icon = models.CharField("icono", max_length=50, blank=True, help_text="Nombre del icono (Lucide) usado en la app.")
    order = models.PositiveIntegerField("orden", default=0)

    class Meta:
        verbose_name = "logro"
        verbose_name_plural = "logros"
        ordering = ["order"]

    def __str__(self):
        return self.title


class UserAchievement(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="achievements"
    )
    achievement = models.ForeignKey(
        Achievement, on_delete=models.CASCADE, related_name="unlocks"
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "logro desbloqueado"
        verbose_name_plural = "logros desbloqueados"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "achievement"], name="unique_user_achievement"
            )
        ]

    def __str__(self):
        return f"{self.user} → {self.achievement}"