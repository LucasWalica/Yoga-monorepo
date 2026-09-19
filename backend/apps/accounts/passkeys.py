import base64
import json
import secrets

from django.conf import settings
from django.core.cache import cache
from rest_framework import serializers
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers.options_to_json import options_to_json
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from .models import PasskeyCredential, User

CHALLENGE_CACHE_PREFIX = "webauthn:challenge:"
CHALLENGE_TIMEOUT_SECONDS = 600


class WebAuthnError(ValueError):
    pass


def _challenge_key(token):
    return f"{CHALLENGE_CACHE_PREFIX}{token}"


def _store_challenge():
    token = secrets.token_urlsafe(32)
    challenge = secrets.token_bytes(32)
    cache.set(_challenge_key(token), challenge, CHALLENGE_TIMEOUT_SECONDS)
    return token, challenge


def _get_challenge(token):
    challenge = cache.get(_challenge_key(token))
    if challenge is None:
        raise WebAuthnError("El desafío expiró. Volvé a intentarlo.")
    return challenge


def request_origin(request):
    return f"{request.scheme}://{request.get_host()}"


def registration_options(request, user):
    token, challenge = _store_challenge()
    exclude = []
    for cred in user.passkeys.all():
        exclude.append(PublicKeyCredentialDescriptor(id=bytes(cred.credential_id)))
    options = generate_registration_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        rp_name=settings.WEBAUTHN_RP_NAME,
        user_id=str(user.id).encode("utf-8"),
        user_name=user.email,
        user_display_name=user.full_name or user.email,
        challenge=challenge,
        authenticator_selection=AuthenticatorSelectionCriteria(
            resident_key=ResidentKeyRequirement.PREFERRED,
            user_verification=UserVerificationRequirement.PREFERRED,
        ),
        exclude_credentials=exclude,
    )
    data = json.loads(options_to_json(options))
    return {"challenge_token": token, "options": data}


def verify_registration(request, user, payload):
    token = payload.get("challenge_token")
    credential = payload.get("response") or payload.get("credential")
    challenge = _get_challenge(token)
    try:
        verified = verify_registration_response(
            credential=credential,
            expected_challenge=challenge,
            expected_rp_id=settings.WEBAUTHN_RP_ID,
            expected_origin=[request_origin(request)],
        )
    except Exception as exc:
        raise WebAuthnError("No se pudo validar la passkey.") from exc
    cache.delete(_challenge_key(token))
    cred = PasskeyCredential.objects.create(
        user=user,
        credential_id=bytes(verified.credential_id),
        public_key=bytes(verified.credential_public_key),
        sign_count=verified.sign_count,
        device_name=payload.get("device_name", ""),
    )
    return cred


def authentication_options(request, email=None, user=None):
    token, challenge = _store_challenge()
    if email:
        user = User.objects.filter(email__iexact=email).first()
    allow = []
    if user:
        for cred in user.passkeys.all():
            allow.append(PublicKeyCredentialDescriptor(id=bytes(cred.credential_id)))
    options = generate_authentication_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        challenge=challenge,
        allow_credentials=allow,
        user_verification=UserVerificationRequirement.PREFERRED,
    )
    data = json.loads(options_to_json(options))
    return {"challenge_token": token, "options": data}


def verify_authentication(request, payload):
    token = payload.get("challenge_token")
    credential = payload.get("credential")
    if not credential or not credential.get("response"):
        raise WebAuthnError("Falta el payload de la passkey.")
    passkey = _find_passkey(credential.get("id", ""))
    if not passkey:
        raise WebAuthnError("Passkey no registrada para este usuario.")
    challenge = _get_challenge(token)
    try:
        verified = verify_authentication_response(
            credential=credential,
            expected_challenge=challenge,
            expected_rp_id=settings.WEBAUTHN_RP_ID,
            expected_origin=[request_origin(request)],
            credential_public_key=bytes(passkey.public_key),
            credential_current_sign_count=passkey.sign_count,
            require_user_verification=False,
        )
    except Exception as exc:
        raise WebAuthnError("La autenticación de passkey falló.") from exc
    cache.delete(_challenge_key(token))
    passkey.sign_count = verified.new_sign_count
    passkey.save(update_fields=["sign_count"])
    return passkey.user


def _find_passkey(credential_id_b64):
    try:
        cred_id = base64.urlsafe_b64decode(credential_id_b64 + "==")
    except Exception:
        raise WebAuthnError("Identificador de passkey inválido.")
    return PasskeyCredential.objects.filter(credential_id=cred_id).first()


# --- Serializers para validar payloads entrantes ---


class PasskeyRegisterVerifySerializer(serializers.Serializer):
    challenge_token = serializers.CharField()
    response = serializers.JSONField()
    device_name = serializers.CharField(max_length=150, required=False, allow_blank=True)


class PasskeyAuthStartSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_null=True)


class PasskeyAuthVerifySerializer(serializers.Serializer):
    challenge_token = serializers.CharField()
    credential = serializers.JSONField()