from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from . import passkeys as passkey_service
from .models import PasskeyCredential, Profile, User
from .serializers import (
    GoogleAuthSerializer,
    RegisterSerializer,
    RequestResetSerializer,
    ResetConfirmSerializer,
    UserSerializer,
)
from .services import clear_auth_cookies, set_auth_cookies


def _auth_response(user, extra=None):
    data = UserSerializer(user).data
    if extra:
        data.update(extra)
    return data


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        response = Response(
            _auth_response(user, {"detail": "Cuenta creada."}),
            status=status.HTTP_201_CREATED,
        )
        set_auth_cookies(response, user)
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        password = request.data.get("password", "")
        user = authenticate(request, email=email, password=password)
        if user is None or not user.is_active:
            return Response(
                {"detail": "Email o contraseña incorrectos."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        response = Response(_auth_response(user, {"detail": "Sesión iniciada."}))
        set_auth_cookies(response, user)
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Sesión cerrada."})
        raw = request.COOKIES.get(settings.JWT_COOKIE_REFRESH)
        if raw:
            try:
                RefreshToken(raw).blacklist()
            except Exception:
                pass
        clear_auth_cookies(response)
        return response


class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw = request.COOKIES.get(settings.JWT_COOKIE_REFRESH)
        if not raw:
            return Response(
                {"detail": "No hay sesión."}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            refresh = RefreshToken(raw)
            user_id = refresh["user_id"]
            user = User.objects.get(pk=user_id, is_active=True)
            if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION", True):
                refresh.blacklist()
        except Exception:
            return Response(
                {"detail": "Sesión inválida o expirada."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        response = Response(_auth_response(user, {"detail": "Sesión renovada."}))
        set_auth_cookies(response, user)
        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from .google import verify_google_token

        try:
            info = verify_google_token(
                id_token=serializer.validated_data.get("id_token"),
                access_token=serializer.validated_data.get("access_token"),
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

        email = info["email"]
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(
                email=email,
                full_name=info.get("full_name", ""),
                avatar_url=info.get("avatar_url", ""),
            )
            Profile.objects.get_or_create(user=user)
        elif info.get("avatar_url"):
            user.avatar_url = info["avatar_url"]
            user.save(update_fields=["avatar_url"])

        response = Response(
            _auth_response(user, {"detail": "Sesión iniciada con Google."})
        )
        set_auth_cookies(response, user)
        return response


class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RequestResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()
        data = {"detail": "Si el email existe, te enviamos un enlace para restablecer la contraseña."}
        if user and user.is_active:
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/reset-password?email={user.email}&token={token}"
            from .tasks import send_password_reset_email

            _dispatch_task(send_password_reset_email, user.email, link)
            from apps.gamification.tasks import run_inline

            if run_inline():
                data["reset_link"] = link
        return Response(data)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        user = User.objects.filter(email__iexact=v["email"]).first()
        if not user or not default_token_generator.check_token(user, v["token"]):
            return Response(
                {"detail": "Enlace inválido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(v["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Contraseña actualizada. Ya podés iniciar sesión."})


# --- Passkeys (WebAuthn) ---


class PasskeyRegisterStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = passkey_service.registration_options(request, request.user)
        return Response(data)


class PasskeyRegisterVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cred = passkey_service.verify_registration(
                request, request.user, request.data
            )
        except passkey_service.WebAuthnError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "detail": "Passkey registrada.",
                "credential_id": cred.pk,
                "device_name": cred.device_name,
            },
            status=status.HTTP_201_CREATED,
        )


class PasskeyLoginStartView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip() or None
        data = passkey_service.authentication_options(request, email=email)
        return Response(data)


class PasskeyLoginVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            user = passkey_service.verify_authentication(request, request.data)
        except passkey_service.WebAuthnError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        response = Response(
            _auth_response(user, {"detail": "Sesión iniciada con passkey."})
        )
        set_auth_cookies(response, user)
        return response


class PasskeyListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        passkeys = PasskeyCredential.objects.filter(user=request.user).values(
            "id", "device_name", "created_at"
        )
        return Response(list(passkeys))


class PasskeyDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        deleted, _ = PasskeyCredential.objects.filter(
            pk=pk, user=request.user
        ).delete()
        if not deleted:
            return Response(
                {"detail": "No encontrada."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response({"detail": "Passkey eliminada."})


def _dispatch_task(task, *args, **kwargs):
    """En dev (DEBUG o eager) el correo se envía en línea; en prod vía Celery."""
    from apps.gamification.tasks import run_inline

    if run_inline():
        task.run(*args, **kwargs)
    else:
        task.delay(*args, **kwargs)