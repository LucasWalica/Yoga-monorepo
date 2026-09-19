import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

function b64ToBuffer(b64) {
  const binary = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function registerPasskey(challengeToken, optionsJson, deviceName) {
  const options = {
    ...optionsJson,
    challenge: b64ToBuffer(optionsJson.challenge),
    user: {
      ...optionsJson.user,
      id: b64ToBuffer(optionsJson.user.id),
    },
    excludeCredentials: optionsJson.excludeCredentials?.map(c => ({
      ...c,
      id: b64ToBuffer(c.id),
    })) ?? [],
  };
  const attestation = await startRegistration({ optionsJSON: options });
  return { challenge_token: challengeToken, response: attestation, device_name: deviceName };
}

export async function authenticatePasskey(challengeToken, optionsJson) {
  const options = {
    ...optionsJson,
    challenge: b64ToBuffer(optionsJson.challenge),
    allowCredentials: optionsJson.allowCredentials?.map(c => ({
      ...c,
      id: b64ToBuffer(c.id),
    })) ?? [],
  };
  const assertion = await startAuthentication({ optionsJSON: options });
  return { challenge_token: challengeToken, credential: assertion };
}