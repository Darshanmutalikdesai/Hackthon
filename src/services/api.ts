import type { Session, UserMetrics, UserProfile } from '../types';

const API_BASE = 'http://localhost:4010';

function getAuthToken() {
  return localStorage.getItem('jwt') || '';
}

async function fetchJson<T>(input: RequestInfo, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers ?? {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, { 
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText || 'API request failed');
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

export function getSession(sessionId: string) {
  return fetchJson<Session>(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}`);
}

export function getUserMetrics(userId: string) {
  const from = '2025-01-01T00:00:00Z';
  const to = '2025-03-31T23:59:59Z';
  const granularity = 'daily';
  const params = new URLSearchParams({ from, to, granularity });
  return fetchJson<UserMetrics>(`${API_BASE}/users/${encodeURIComponent(userId)}/metrics?${params}`);
}

export function getUserProfile(userId: string) {
  return fetchJson<UserProfile>(`${API_BASE}/users/${encodeURIComponent(userId)}/profile`);
}

export async function postSessionDebrief(sessionId: string, payload: { overallMood: string; keyLesson: string; planAdherenceRating: number; }) {
  return fetchJson(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/debrief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getCoachingUrl(sessionId: string) {
  const endpoint = `${API_BASE}/sessions/${encodeURIComponent(sessionId)}/coaching`;
  // Note: EventSource doesn't support custom headers, so we return endpoint as-is
  // The mock server (Prism) should be configured to serve this without strict auth
  return endpoint;
}
