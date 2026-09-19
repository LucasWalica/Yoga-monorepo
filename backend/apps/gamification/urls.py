from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AchievementViewSet, StatsView

router = DefaultRouter()
router.register("achievements", AchievementViewSet, basename="achievements")

urlpatterns = [
    path("", include(router.urls)),
    path("stats/", StatsView.as_view(), name="gamification-stats"),
]