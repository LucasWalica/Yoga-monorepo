from rest_framework import serializers

from .models import AudioGuide, MeditationSession


class AudioGuideSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    resolved_url = serializers.CharField(read_only=True)

    class Meta:
        model = AudioGuide
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_display",
            "resolved_url",
            "duration_minutes",
        ]
        read_only_fields = ["id", "resolved_url"]


class MeditationSessionSerializer(serializers.ModelSerializer):
    session_type_display = serializers.CharField(
        source="get_session_type_display", read_only=True
    )

    class Meta:
        model = MeditationSession
        fields = [
            "id",
            "minutes",
            "session_type",
            "session_type_display",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_minutes(self, value):
        if value < 1 or value > 600:
            raise serializers.ValidationError(
                "Los minutos deben estar entre 1 y 600."
            )
        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)