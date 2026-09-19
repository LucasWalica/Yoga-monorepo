from django.urls import path

from .views import (
    GoogleAuthView,
    LoginView,
    LogoutView,
    MeView,
    PasskeyDeleteView,
    PasskeyListView,
    PasskeyLoginStartView,
    PasskeyLoginVerifyView,
    PasskeyRegisterStartView,
    PasskeyRegisterVerifyView,
    PasswordResetConfirmView,
    PasswordResetView,
    RefreshView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("google/", GoogleAuthView.as_view(), name="google"),
    path("password/reset/", PasswordResetView.as_view(), name="password-reset"),
    path(
        "password/reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path(
        "passkey/register/start/",
        PasskeyRegisterStartView.as_view(),
        name="passkey-register-start",
    ),
    path(
        "passkey/register/verify/",
        PasskeyRegisterVerifyView.as_view(),
        name="passkey-register-verify",
    ),
    path(
        "passkey/login/start/",
        PasskeyLoginStartView.as_view(),
        name="passkey-login-start",
    ),
    path(
        "passkey/login/verify/",
        PasskeyLoginVerifyView.as_view(),
        name="passkey-login-verify",
    ),
    path("passkeys/", PasskeyListView.as_view(), name="passkeys-list"),
    path(
        "passkeys/<int:pk>/",
        PasskeyDeleteView.as_view(),
        name="passkey-delete",
    ),
]