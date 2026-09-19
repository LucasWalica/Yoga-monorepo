from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.gamification.tasks import dispatch_record_activity

from .models import AudioGuide, MeditationSession
from .serializers import AudioGuideSerializer, MeditationSessionSerializer


class AudioGuideListView(generics.ListAPIView):
    serializer_class = AudioGuideSerializer
    permission_classes = [permissions.AllowAny]
    queryset = AudioGuide.objects.filter(is_active=True)


class MeditationSessionCreateView(APIView):
    """Registra una sesión de meditación/pomodoro completada y suma minutos + logros."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MeditationSessionSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        session = serializer.save()

        activity_type = "pomodoro" if session.session_type == "pomodoro" else "meditation"
        dispatch_record_activity(
            request.user.id,
            minutes=session.minutes,
            activity_type=activity_type,
        )
        return Response(
            MeditationSessionSerializer(session).data,
            status=status.HTTP_201_CREATED,
        )


class MeditationSessionListView(generics.ListAPIView):
    serializer_class = MeditationSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MeditationSession.objects.filter(user=self.request.user).order_by("-created_at")