from django.urls import path

from .views import (
    AttendClassView,
    ClassRequestListView,
    LiveClassDetailView,
    LiveClassListView,
    RecordedClassListView,
    ResourceListView,
)

urlpatterns = [
    path("", LiveClassListView.as_view(), name="classes-list"),
    path("<int:pk>/", LiveClassDetailView.as_view(), name="class-detail"),
    path("<int:pk>/attend/", AttendClassView.as_view(), name="class-attend"),
    path("recorded/", RecordedClassListView.as_view(), name="recorded-list"),
    path("requests/", ClassRequestListView.as_view(), name="class-requests"),
    path("resources/", ResourceListView.as_view(), name="resources-list"),
]