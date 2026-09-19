from rest_framework import serializers

from .models import Profile, User


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "streak_days",
            "longest_streak",
            "total_minutes",
            "last_active_date",
            "classes_attended",
        ]
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "avatar_url",
            "date_joined",
            "profile",
        ]
        read_only_fields = ["id", "email", "date_joined"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con ese email.")
        return value.lower()

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data.get("full_name", ""),
        )
        Profile.objects.create(user=user)
        return user


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(write_only=True, required=False)
    access_token = serializers.CharField(write_only=True, required=False)

    def validate(self, attrs):
        if not attrs.get("id_token") and not attrs.get("access_token"):
            raise serializers.ValidationError(
                "Debe enviarse id_token o access_token de Google."
            )
        return attrs


class RequestResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)