from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.gamification.tasks import dispatch_record_activity

from .models import (
    Attendance,
    ClassRequest,
    LiveClass,
    RecordedClass,
    Resource,
)
from .serializers import (
    ClassRequestSerializer,
    LiveClassDetailSerializer,
    LiveClassSerializer,
    RecordedClassSerializer,
    ResourceSerializer,
)


class LiveClassListView(generics.ListAPIView):
    """Clases en vivo futuras (order cronológico asc) o fines pasados con ?past=1."""

    serializer_class = LiveClassSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = LiveClass.objects.filter(is_active=True)
        if self.request.query_params.get("past"):
            return qs.filter(scheduled_start__lt=timezone.now())
        return qs.filter(scheduled_start__gte=timezone.now())


class LiveClassDetailView(generics.RetrieveAPIView):
    serializer_class = LiveClassDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = LiveClass.objects.filter(is_active=True)


class RecordedClassListView(generics.ListAPIView):
    serializer_class = RecordedClassSerializer
    permission_classes = [permissions.AllowAny]
    queryset = RecordedClass.objects.filter(is_active=True)


class AttendClassView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        live_class = LiveClass.objects.filter(pk=pk, is_active=True).first()
        if not live_class:
            return Response({"detail": "Clase no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        try:
            with transaction.atomic():
                Attendance.objects.create(user=request.user, live_class=live_class)
        except IntegrityError:
            return Response({"detail": "Ya registraste asistencia a esta clase."}, status=status.HTTP_200_OK)

        dispatch_record_activity(
            request.user.id,
            minutes=live_class.duration_minutes,
            activity_type="class",
        )
        return Response(
            {"detail": "Asistencia registrada. Som Namasté."},
            status=status.HTTP_201_CREATED,
        )


class ClassRequestListView(generics.ListCreateAPIView):
    """Solicitudes del usuario logueado (lista y crear)."""

    serializer_class = ClassRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ClassRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResourceListView(generics.ListAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Resource.objects.filter(is_active=True)