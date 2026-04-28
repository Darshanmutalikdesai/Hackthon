import type { Session, Trade, UserMetrics, UserProfile } from '../types';
import { validateTenancy, isTokenExpired } from '../utils/auth';

const API_BASE = import.meta.env.DEV ? 'http://localhost:4010' : '/api';

const DEMO_USER_ID = 'f412f236-4edc-47a2-8f54-8763a6ed2ce8';

const MOCK_SESSION_IDS = [
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'd4e5f6a7-b8c9-0123-def1-234567890123',
  'e5f6a7b8-c9d0-1234-ef12-345678901234',
  'f6a7b8c9-d0e1-2345-f123-456789012345',
  'a7b8c9d0-e1f2-3456-1234-567890123456',
  'b8c9d0e1-f2a3-4567-2345-678901234567',
  'c9d0e1f2-a3b4-5678-3456-789012345678',
  'd0e1f2a3-b4c5-6789-4567-890123456789',
  'e1f2a3b4-c5d6-7890-5678-901234567890',
];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function seededNumber(seed: number, min: number, max: number) {
  const normalized = (Math.sin(seed) + 1) / 2;
  return min + normalized * (max - min);
}

function buildMockUserProfile(userId: string): UserProfile {
  return {
    userId,
    name: 'Alex Mercer',
    generatedAt: new Date().toISOString(),
    dominantPathologies: [
      { pathology: 'Overconfidence drift', confidence: 0.82, evidenceSessions: ['session-1', 'session-2'], evidenceTrades: ['trade-1'] },
      { pathology: 'Late entry bias', confidence: 0.67, evidenceSessions: ['session-3'], evidenceTrades: ['trade-4'] },
      { pathology: 'Reaction lag', confidence: 0.54, evidenceSessions: ['session-4'], evidenceTrades: ['trade-7'] },
    ],
  };
}

function buildMockUserMetrics(userId: string): UserMetrics {
  const start = new Date('2025-01-01T00:00:00Z');
  const timeseries = Array.from({ length: 90 }, (_, index) => {
    const bucket = new Date(start);
    bucket.setDate(start.getDate() + index);
    const seed = hashString(`${userId}:${index}`);
    return {
      bucket: bucket.toISOString(),
      tradeCount: Math.max(1, Math.round(seededNumber(seed, 2, 8))),
      winRate: Math.max(0.1, Math.min(0.95, seededNumber(seed + 17, 0.35, 0.88))),
      totalPnl: Number(seededNumber(seed + 31, -220, 480).toFixed(2)),
      planAdherenceScore: Math.max(0.15, Math.min(0.98, seededNumber(seed + 53, 0.42, 0.92))),
    };
  });

  const planAdherenceScore = timeseries.reduce((acc, item) => acc + item.planAdherenceScore, 0) / timeseries.length;
  const sessionTiltIndex = timeseries.reduce((acc, item) => acc + (1 - item.planAdherenceScore), 0) / timeseries.length;

  return {
    userId,
    granularity: 'daily',
    from: '2025-01-01T00:00:00Z',
    to: '2025-03-31T23:59:59Z',
    planAdherenceScore,
    sessionTiltIndex,
    winRateByEmotionalState: {
      calm: { wins: 26, losses: 9, winRate: 0.743 },
      anxious: { wins: 12, losses: 15, winRate: 0.444 },
      greedy: { wins: 8, losses: 13, winRate: 0.381 },
      fearful: { wins: 10, losses: 11, winRate: 0.476 },
      neutral: { wins: 20, losses: 16, winRate: 0.556 },
    },
    revengeTrades: 4,
    overtradingEvents: 6,
    timeseries,
  };
}

function buildMockSession(sessionId: string): Session {
  const seed = hashString(sessionId);
  const date = new Date('2025-01-06T09:30:00Z');
  date.setDate(date.getDate() + (seed % 21));

  const assets = ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMD'];
  const trades: Trade[] = assets.map((asset, index) => {
    const tradeSeed = seed + index * 97;
    const entryPrice = Number(seededNumber(tradeSeed, 72, 320).toFixed(2));
    const movement = seededNumber(tradeSeed + 5, -0.08, 0.11);
    const exitPrice = Number((entryPrice * (1 + movement)).toFixed(2));
    const pnl = Number(((exitPrice - entryPrice) * 10).toFixed(2));
    const win = pnl >= 0;
    const planAdherence = Math.max(1, Math.min(5, Math.round(seededNumber(tradeSeed + 11, 2, 5))));
    const entryAt = new Date(date);
    entryAt.setMinutes(entryAt.getMinutes() + index * 18);
    const exitAt = new Date(entryAt);
    exitAt.setMinutes(exitAt.getMinutes() + 22 + index * 4);

    return {
      tradeId: `${sessionId}-trade-${index + 1}`,
      userId: DEMO_USER_ID,
      sessionId,
      asset,
      assetClass: index % 3 === 0 ? 'equity' : index % 3 === 1 ? 'forex' : 'crypto',
      direction: win ? 'long' : 'short',
      entryPrice,
      exitPrice,
      quantity: 10 + index,
      entryAt: entryAt.toISOString(),
      exitAt: exitAt.toISOString(),
      status: 'closed',
      outcome: win ? 'win' : 'loss',
      pnl,
      planAdherence,
      emotionalState: ['calm', 'anxious', 'greedy', 'fearful', 'neutral'][index % 5] as Trade['emotionalState'],
      entryRationale: `Deterministic mock trade ${index + 1} for session ${sessionId}`,
    };
  });

  const winRate = trades.filter((trade) => trade.outcome === 'win').length / trades.length;
  const totalPnl = Number(trades.reduce((acc, trade) => acc + (trade.pnl || 0), 0).toFixed(2));

  return {
    sessionId,
    userId: DEMO_USER_ID,
    date: date.toISOString(),
    notes: 'Mock session generated in the frontend fallback',
    tradeCount: trades.length,
    winRate,
    totalPnl,
    trades,
  };
}

function shouldUseFallback() {
  return import.meta.env.PROD;
}

async function fetchMockJson<T>(input: RequestInfo): Promise<T> {
  const url = typeof input === 'string' ? input : input.url;

  if (url.includes('/users/') && url.includes('/profile')) {
    const userId = url.split('/users/')[1]?.split('/')[0] || DEMO_USER_ID;
    return buildMockUserProfile(decodeURIComponent(userId)) as T;
  }

  if (url.includes('/users/') && url.includes('/metrics')) {
    const userId = url.split('/users/')[1]?.split('/')[0] || DEMO_USER_ID;
    return buildMockUserMetrics(decodeURIComponent(userId)) as T;
  }

  if (url.includes('/sessions/') && !url.includes('/coaching') && !url.includes('/debrief')) {
    const sessionId = url.split('/sessions/')[1]?.split('?')[0] || MOCK_SESSION_IDS[0];
    return buildMockSession(decodeURIComponent(sessionId)) as T;
  }

  if (url.includes('/debrief')) {
    return {
      debriefId: `debrief-${Date.now()}`,
      sessionId: url.split('/sessions/')[1]?.split('/')[0] || MOCK_SESSION_IDS[0],
      savedAt: new Date().toISOString(),
    } as T;
  }

  throw new Error('No fallback data available for this request');
}

function getAuthToken() {
  return localStorage.getItem('jwt') || '';
}

async function fetchJson<T>(input: RequestInfo, init: RequestInit = {}, fallback?: () => Promise<T> | T) {
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

  const contentType = response.headers.get('content-type') || '';
  const bodyText = await response.text();

  const canFallback = shouldUseFallback() && fallback;

  if (!response.ok) {
    if (canFallback) {
      return Promise.resolve(fallback());
    }
    throw new Error(bodyText || response.statusText || 'API request failed');
  }

  if (!contentType.includes('application/json') || bodyText.trimStart().startsWith('<')) {
    if (canFallback) {
      return Promise.resolve(fallback());
    }
    throw new Error('API returned HTML instead of JSON');
  }

  // Handle specific error responses
  if (response.status === 401) {
    throw new Error('Unauthorized: Invalid or expired token');
  }

  if (response.status === 403) {
    throw new Error('Forbidden: Cross-tenant access denied');
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return JSON.parse(bodyText) as T;
}

export function getSession(sessionId: string) {
  return fetchJson<Session>(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}`, {}, () => fetchMockJson<Session>(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}`));
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
  return fetchJson<UserMetrics>(`${API_BASE}/users/${encodeURIComponent(userId)}/metrics?${params}`, {}, () => fetchMockJson<UserMetrics>(`${API_BASE}/users/${encodeURIComponent(userId)}/metrics?${params}`));
}

export function getUserProfile(userId: string) {
  // Validate row-level tenancy
  if (!validateTenancy(userId)) {
    throw new Error('Forbidden: Cannot access another user\'s data');
  }

  return fetchJson<UserProfile>(`${API_BASE}/users/${encodeURIComponent(userId)}/profile`, {}, () => fetchMockJson<UserProfile>(`${API_BASE}/users/${encodeURIComponent(userId)}/profile`));
}

export async function postSessionDebrief(sessionId: string, payload: { overallMood: string; keyLesson: string; planAdherenceRating: number; }) {
  return fetchJson(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/debrief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, () => fetchMockJson(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/debrief`));
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
