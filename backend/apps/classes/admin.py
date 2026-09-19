from django.contrib import admin
from django.utils import timezone

from .models import Attendance, ClassRequest, LiveClass, RecordedClass, Resource


@admin.register(LiveClass)
class LiveClassAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "scheduled_start",
        "duration_minutes",
        "level",
        "capacity",
        "is_active",
        "registrations_count",
    ]
    list_filter = ["is_active", "level", "scheduled_start"]
    search_fields = ["title", "description"]
    list_editable = ["is_active"]
    date_hierarchy = "scheduled_start"
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "description",
                    "youtube_url",
                    "scheduled_start",
                    "duration_minutes",
                    "level",
                    "capacity",
                ),
                "description": (
                    "Por ejemplo: pegá el link del directo de YouTube, elegí hora y "
                    "duración. Los alumnos van a ver la clase embebida en la app."
                ),
            },
        ),
        ("Estado", {"fields": ("is_active", "created_by")}),
    )

    def registrations_count(self, obj):
        return obj.attendances.count()

    registrations_count.short_description = "asistentes"


@admin.register(RecordedClass)
class RecordedClassAdmin(admin.ModelAdmin):
    list_display = ["title", "duration_minutes", "level", "is_active", "created_at"]
    list_filter = ["is_active", "level"]
    search_fields = ["title", "description"]
    list_editable = ["is_active"]


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ["user", "live_class", "attended_at"]
    search_fields = ["user__email", "live_class__title"]
    date_hierarchy = "attended_at"


@admin.register(ClassRequest)
class ClassRequestAdmin(admin.ModelAdmin):
    list_display = ["user", "class_type", "preferred_time", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["user__email", "message", "class_type"]
    list_editable = ["status"]
    fieldsets = (
        (None, {"fields": ("user", "class_type", "preferred_time", "message")}),
        (
            "Gestión",
            {
                "fields": ("status", "admin_note"),
                "description": (
                    "Cuando respondas, escribí tu mensaje en 'Respuesta del profe'. "
                    "El alumno lo verá en la app."
                ),
            },
        ),
    )


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ["title", "kind", "is_active", "created_at"]
    list_filter = ["kind", "is_active"]
    search_fields = ["title", "description"]
    list_editable = ["is_active"]