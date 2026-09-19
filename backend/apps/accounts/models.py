from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField("email", unique=True)
    full_name = models.CharField("nombre completo", max_length=150, blank=True)
    avatar_url = models.URLField("avatar", blank=True)
    is_active = models.BooleanField("activo", default=True)
    is_staff = models.BooleanField("staff", default=False)
    date_joined = models.DateTimeField("fecha de registro", default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return self.full_name or self.email


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    streak_days = models.PositiveIntegerField("racha actual (días)", default=0)
    longest_streak = models.PositiveIntegerField("racha más larga", default=0)
    total_minutes = models.PositiveIntegerField("minutos totales", default=0)
    last_active_date = models.DateField("último día activo", null=True, blank=True)

    class Meta:
        verbose_name = "perfil"
        verbose_name_plural = "perfiles"

    def __str__(self):
        return f"Perfil de {self.user}"

    @property
    def classes_attended(self):
        return self.user.attendance_set.count()


class PasskeyCredential(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="passkeys",
    )
    credential_id = models.BinaryField("identificador", unique=True)
    public_key = models.BinaryField("clave pública", max_length=1024)
    sign_count = models.PositiveIntegerField("contador de uso", default=0)
    device_name = models.CharField("dispositivo", max_length=150, blank=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)

    class Meta:
        verbose_name = "passkey"
        verbose_name_plural = "passkeys"

    def __str__(self):
        return self.device_name or f"Passkey de {self.user}"