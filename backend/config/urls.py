from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

admin.site.site_header = "Seba Yoga · Panel"
admin.site.site_title = "Panel de Seba Yoga"
admin.site.index_title = "Gestión del estudio"

urlpatterns = [
    path("admin/", admin.site.urls),
    # API
    path("api/auth/", include("apps.accounts.urls")),
    path("api/classes/", include("apps.classes.urls")),
    path("api/meditation/", include("apps.meditation.urls")),
    path("api/gamification/", include("apps.gamification.urls")),
    # Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)