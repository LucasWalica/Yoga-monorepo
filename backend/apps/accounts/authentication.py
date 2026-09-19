from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Lee el JWT de la cookie `seba_access` y, si no está, del header
    `Authorization: Bearer ...` (para clientes nativos / Capacitor)."""

    def get_raw_token(self, header):
        return header

    def authenticate(self, request):
        raw = request.COOKIES.get(settings.JWT_COOKIE_ACCESS)
        header = self.get_header(request)
        if not raw and header:
            raw = super().get_raw_token(header)
        if not raw:
            return None
        try:
            validated_token = self.get_validated_token(raw)
        except Exception:
            return None
        return self.get_user(validated_token), validated_token