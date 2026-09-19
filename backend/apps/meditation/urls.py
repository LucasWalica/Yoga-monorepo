from django.urls import path

from .views import (
    AudioGuideListView,
    MeditationSessionCreateView,
    MeditationSessionListView,
)

urlpatterns = [
    path("audios/", AudioGuideListView.as_view(), name="audio-guides"),
    path("sessions/", MeditationSessionCreateView.as_view(), name="session-create"),
    path(
        "sessions/mine/",
        MeditationSessionListView.as_view(),
        name="session-mine",
    ),
]