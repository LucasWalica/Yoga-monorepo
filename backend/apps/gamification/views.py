from django.db.models import Sum
from django.utils import timezone
from rest_framework import response, serializers, views, viewsets
from rest_framework import permissions

from .models import Achievement, UserAchievement
from .services import compute_stats


class AchievementSerializer(serializers.ModelSerializer):
    unlocked = serializers.SerializerMethodField()
    unlocked_at = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ["code", "title", "description", "icon", "order", "unlocked", "unlocked_at"]

    def get_unlocked(self, obj):
        return bool(self.context["unlocked"].get(obj.id))

    def get_unlocked_at(self, obj):
        value = self.context["unlocked"].get(obj.id)
        return value.isoformat() if value else None


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ["order"]

    def get_queryset(self):
        return Achievement.objects.all()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if self.request.user.is_authenticated:
            ctx["unlocked"] = {
                ua.achievement_id: ua.unlocked_at
                for ua in UserAchievement.objects.filter(user=self.request.user)
            }
        else:
            ctx["unlocked"] = {}
        return ctx


class StatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        stats = compute_stats(request.user)
        unlocked = UserAchievement.objects.filter(user=request.user).count()
        total = Achievement.objects.count()
        week_minutes = (
            request.user.meditation_sessions.filter(
                created_at__gte=timezone.now() - timezone.timedelta(days=7)
            ).aggregate(total_minutes=Sum("minutes"))["total_minutes"]
            or 0
        )
        return response.Response(
            {
                **stats,
                "achievements_unlocked": unlocked,
                "achievements_total": total,
                "minutes_last_7_days": week_minutes,
            }
        )