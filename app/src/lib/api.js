const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || 'Error en la petición');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function requestWithRetry(path, options = {}, retried = false) {
  try {
    return await request(path, options);
  } catch (e) {
    if (!retried && e.status === 401 && path !== '/api/auth/refresh/' && path !== '/api/auth/login/' && path !== '/api/auth/register/') {
      await refresh();
      return requestWithRetry(path, options, true);
    }
    throw e;
  }
}

export async function apiGet(path) {
  return requestWithRetry(path, { method: 'GET' });
}

export async function apiPost(path, body) {
  return requestWithRetry(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiDelete(path) {
  return requestWithRetry(path, { method: 'DELETE' });
}

export async function login(email, password) {
  return apiPost('/api/auth/login/', { email, password });
}

export async function register(email, fullName, password) {
  return apiPost('/api/auth/register/', { email, full_name: fullName, password });
}

export async function logout() {
  return apiPost('/api/auth/logout/', {});
}

export async function refresh() {
  return apiPost('/api/auth/refresh/', {});
}

export async function me() {
  return apiGet('/api/auth/me/');
}

export async function googleAuth(token) {
  return apiPost('/api/auth/google/', { access_token: token });
}

export async function passwordReset(email) {
  return apiPost('/api/auth/password/reset/', { email });
}

export async function passwordResetConfirm(email, token, newPassword) {
  return apiPost('/api/auth/password/reset/confirm/', { email, token, new_password: newPassword });
}

export async function passkeyRegisterStart() {
  return apiPost('/api/auth/passkey/register/start/', {});
}

export async function passkeyRegisterVerify(challengeToken, credential, deviceName) {
  return apiPost('/api/auth/passkey/register/verify/', { challenge_token: challengeToken, response: credential, device_name: deviceName });
}

export async function passkeyLoginStart(email) {
  return apiPost('/api/auth/passkey/login/start/', { email });
}

export async function passkeyLoginVerify(challengeToken, credential) {
  return apiPost('/api/auth/passkey/login/verify/', { challenge_token: challengeToken, credential });
}

export async function listPasskeys() {
  return apiGet('/api/auth/passkeys/');
}

export async function deletePasskey(id) {
  return apiDelete(`/api/auth/passkeys/${id}/`);
}

export async function listLiveClasses(past = false) {
  return apiGet(`/api/classes/?${past ? 'past=1' : ''}`);
}

export async function getClassDetail(id) {
  return apiGet(`/api/classes/${id}/`);
}

export async function attendClass(id) {
  return apiPost(`/api/classes/${id}/attend/`, {});
}

export async function listRecordedClasses() {
  return apiGet('/api/classes/recorded/');
}

export async function listResources() {
  return apiGet('/api/classes/resources/');
}

export async function listClassRequests() {
  return apiGet('/api/classes/requests/');
}

export async function createClassRequest(data) {
  return apiPost('/api/classes/requests/', data);
}

export async function listAudioGuides() {
  return apiGet('/api/meditation/audios/');
}

export async function createMeditationSession(data) {
  return apiPost('/api/meditation/sessions/', data);
}

export async function listMySessions() {
  return apiGet('/api/meditation/sessions/mine/');
}

export async function getStats() {
  return apiGet('/api/gamification/stats/');
}

export async function listAchievements() {
  return apiGet('/api/gamification/achievements/');
}