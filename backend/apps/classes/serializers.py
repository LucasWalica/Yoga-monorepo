from rest_framework import serializers

from .models import Attendance, ClassRequest, LiveClass, RecordedClass, Resource


class LiveClassSerializer(serializers.ModelSerializer):
    level_display = serializers.CharField(source="get_level_display", read_only=True)

    class Meta:
        model = LiveClass
        fields = [
            "id",
            "title",
            "description",
            "youtube_url",
            "scheduled_start",
            "duration_minutes",
            "level",
            "level_display",
            "capacity",
            "is_active",
        ]
        read_only_fields = ["id"]


class LiveClassDetailSerializer(LiveClassSerializer):
    attendees_count = serializers.SerializerMethodField()
    attended = serializers.SerializerMethodField()

    class Meta(LiveClassSerializer.Meta):
        fields = LiveClassSerializer.Meta.fields + ["attendees_count", "attended"]

    def get_attendees_count(self, obj):
        return obj.attendances.count()

    def get_attended(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.attendances.filter(user=request.user).exists()


class RecordedClassSerializer(serializers.ModelSerializer):
    level_display = serializers.CharField(source="get_level_display", read_only=True)

    class Meta:
        model = RecordedClass
        fields = [
            "id",
            "title",
            "description",
            "youtube_url",
            "thumbnail_url",
            "duration_minutes",
            "level",
            "level_display",
        ]
        read_only_fields = ["id"]


class ClassRequestSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ClassRequest
        fields = [
            "id",
            "class_type",
            "preferred_time",
            "message",
            "status",
            "status_display",
            "admin_note",
            "created_at",
        ]
        read_only_fields = ["id", "status", "admin_note", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ResourceSerializer(serializers.ModelSerializer):
    kind_display = serializers.CharField(source="get_kind_display", read_only=True)
    resolved_url = serializers.CharField(read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "kind",
            "kind_display",
            "resolved_url",
            "created_at",
        ]
        read_only_fields = ["id", "resolved_url", "created_at"]


class AttendanceSerializer(serializers.Serializer):
    live_class = serializers.IntegerField()