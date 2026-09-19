import logging

from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

logger = logging.getLogger("sebasyoga")


def verify_google_token(id_token=None, access_token=None):
    """Verifica un token de Google y devuelve datos del usuario.

    `id_token`: verificado con la audiencia oficial del client_id.
    `access_token`: consultado contra la userinfo endpoint.
    """
    if id_token:
        try:
            info = google_id_token.verify_oauth2_token(
                id_token,
                google_requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
        except Exception as exc:
            logger.warning("Token de Google inválido: %s", exc)
            raise ValueError("El token de Google no es válido.") from exc
        email = (info.get("email") or "").lower()
        if not email:
            raise ValueError("El token de Google no incluye un email.")
        return {
            "email": email,
            "full_name": info.get("name", ""),
            "avatar_url": info.get("picture", ""),
        }

    if access_token:
        import requests

        resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        if resp.status_code != 200:
            raise ValueError("El token de acceso de Google no es válido.")
        info = resp.json()
        email = (info.get("email") or "").lower()
        if not email:
            raise ValueError("El token de Google no incluye un email.")
        return {
            "email": email,
            "full_name": info.get("name", ""),
            "avatar_url": info.get("picture", ""),
        }

    raise ValueError("No se recibió ningún token.")