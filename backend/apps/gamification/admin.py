from django.contrib import admin

from .models import Achievement, UserAchievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ["order", "code", "title", "icon"]
    list_display_links = ["code", "title"]
    list_editable = ["order", "icon"]
    search_fields = ["title", "code"]


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ["user", "achievement", "unlocked_at"]
    list_filter = ["achievement"]
    search_fields = ["user__email"]
    date_hierarchy = "unlocked_at"