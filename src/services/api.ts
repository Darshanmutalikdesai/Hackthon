import type { Session, UserMetrics, UserProfile } from '../types';
import { validateTenancy, isTokenExpired } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4010';

function getAuthToken() {
  return localStorage.getItem('jwt') || '';
}

async function fetchJson<T>(input: RequestInfo, init: RequestInit = {}) {
  // Check token expiration
  if (isTokenExpired()) {
    throw new Error('Session expired. Please refresh the page and log in again.');
  }

  const token = getAuthToken();
  const headers = new Headers(init.headers ?? {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, { 
    ...init,
    headers,
  });

  // Handle specific error responses
  if (response.status === 401) {
    throw new Error('Unauthorized: Invalid or expired token');
  }

  if (response.status === 403) {
    throw new Error('Forbidden: Cross-tenant access denied');
  }

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
  // Validate row-level tenancy
  if (!validateTenancy(userId)) {
    throw new Error('Forbidden: Cannot access another user\'s data');
  }

  const from = '2025-01-01T00:00:00Z';
  const to = '2025-03-31T23:59:59Z';
  const granularity = 'daily';
  const params = new URLSearchParams({ from, to, granularity });
  return fetchJson<UserMetrics>(`${API_BASE}/users/${encodeURIComponent(userId)}/metrics?${params}`);
}

export function getUserProfile(userId: string) {
  // Validate row-level tenancy
  if (!validateTenancy(userId)) {
    throw new Error('Forbidden: Cannot access another user\'s data');
  }

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
  const token = getAuthToken();
  const endpoint = `${API_BASE}/sessions/${encodeURIComponent(sessionId)}/coaching`;
  // EventSource doesn't support custom headers, so pass token as query parameter
  if (token) {
    return `${endpoint}?token=${encodeURIComponent(token)}`;
  }
  return endpoint;
}
