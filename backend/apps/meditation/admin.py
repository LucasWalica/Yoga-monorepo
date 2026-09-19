from django.contrib import admin

from .models import AudioGuide, MeditationSession


@admin.register(AudioGuide)
class AudioGuideAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "duration_minutes", "is_active", "created_at"]
    list_filter = ["category", "is_active"]
    search_fields = ["title", "description"]
    list_editable = ["is_active"]
    fieldsets = (
        (
            None,
            {
                "fields": ("title", "description", "category"),
                "description": (
                    "Podés subir un archivo de audio o pegar un enlace. "
                    "La app lo mostrará en el apartado de Meditación."
                ),
            },
        ),
        ("Audio", {"fields": ("url", "file", "duration_minutes")}),
        ("Estado", {"fields": ("is_active",)}),
    )


@admin.register(MeditationSession)
class MeditationSessionAdmin(admin.ModelAdmin):
    list_display = ["user", "session_type", "minutes", "created_at"]
    list_filter = ["session_type", "created_at"]
    search_fields = ["user__email"]
    date_hierarchy = "created_at"