type RequestLike = {
  headers: {
    authorization?: string;
  };
  query?: Record<string, string | string[] | undefined>;
};

export const DEMO_USER_ID = 'f412f236-4edc-47a2-8f54-8763a6ed2ce8';
export const DEMO_USER_NAME = 'Alex Mercer';
export const DEMO_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNDEyZjIzNi00ZWRjLTQ3YTItOGY1NC04NzYzYTZlZDJjZTgiLCJpYXQiOjE3NzcyODgwOTQsImV4cCI6MTc3NzM3NDQ5NCwicm9sZSI6InRyYWRlciIsIm5hbWUiOiJBbGV4IE1lcmNlciJ9.jaocuOfDvZXcpNHI9_jnFQ4ezJCuxlAk9TsWD0YiOEk';

export type SessionSummary = {
  sessionId: string;
  userId: string;
  date: string;
  notes?: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  trades: Array<{
    tradeId: string;
    userId: string;
    sessionId: string;
    asset: string;
    assetClass: 'equity' | 'crypto' | 'forex';
    direction: 'long' | 'short';
    entryPrice: number;
    exitPrice?: number;
    quantity: number;
    entryAt: string;
    exitAt?: string;
    status: 'open' | 'closed' | 'cancelled';
    outcome?: 'win' | 'loss';
    pnl?: number;
    planAdherence?: number;
    emotionalState?: 'calm' | 'anxious' | 'greedy' | 'fearful' | 'neutral';
    entryRationale?: string;
  }>;
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function getToken(req: RequestLike) {
  const bearer = req.headers.authorization;
  if (bearer?.startsWith('Bearer ')) {
    return bearer.slice(7);
  }

  const queryToken = req.query?.token;
  if (Array.isArray(queryToken)) {
    return queryToken[0] ?? '';
  }

  return queryToken || '';
}

export function getUserIdFromToken(token: string) {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(decodeBase64Url(payload)) as { sub?: string };
    return decoded.sub || null;
  } catch {
    return null;
  }
}

export function requireUser(req: RequestLike) {
  const token = getToken(req);
  const userId = getUserIdFromToken(token);

  if (!token || !userId) {
    return { status: 401, message: 'Unauthorized: Invalid or missing token' } as const;
  }

  return { token, userId } as const;
}

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

export function buildUserProfile(userId: string) {
  return {
    userId,
    name: DEMO_USER_NAME,
    generatedAt: new Date().toISOString(),
    dominantPathologies: [
      { pathology: 'Overconfidence drift', confidence: 0.82, evidenceSessions: ['session-1', 'session-2'], evidenceTrades: ['trade-1'] },
      { pathology: 'Late entry bias', confidence: 0.67, evidenceSessions: ['session-3'], evidenceTrades: ['trade-4'] },
      { pathology: 'Reaction lag', confidence: 0.54, evidenceSessions: ['session-4'], evidenceTrades: ['trade-7'] },
    ],
  };
}

export function buildUserMetrics(userId: string) {
  const start = new Date('2025-01-01T00:00:00Z');
  const timeseries = Array.from({ length: 90 }, (_, index) => {
    const bucket = new Date(start);
    bucket.setDate(start.getDate() + index);
    const seed = hashString(`${userId}:${index}`);
    const tradeCount = Math.max(1, Math.round(seededNumber(seed, 2, 8)));
    const winRate = Math.max(0.1, Math.min(0.95, seededNumber(seed + 17, 0.35, 0.88)));
    const totalPnl = Number(seededNumber(seed + 31, -220, 480).toFixed(2));
    const planAdherenceScore = Math.max(0.15, Math.min(0.98, seededNumber(seed + 53, 0.42, 0.92)));

    return {
      bucket: bucket.toISOString(),
      tradeCount,
      winRate,
      totalPnl,
      planAdherenceScore,
    };
  });

  const planAdherenceScore = timeseries.reduce((acc, item) => acc + item.planAdherenceScore, 0) / timeseries.length;
  const sessionTiltIndex = timeseries.reduce((acc, item) => acc + (1 - item.planAdherenceScore), 0) / timeseries.length;
  const winRateByEmotionalState = {
    calm: { wins: 26, losses: 9, winRate: 0.743 },
    anxious: { wins: 12, losses: 15, winRate: 0.444 },
    greedy: { wins: 8, losses: 13, winRate: 0.381 },
    fearful: { wins: 10, losses: 11, winRate: 0.476 },
    neutral: { wins: 20, losses: 16, winRate: 0.556 },
  };

  return {
    userId,
    granularity: 'daily',
    from: '2025-01-01T00:00:00Z',
    to: '2025-03-31T23:59:59Z',
    planAdherenceScore,
    sessionTiltIndex,
    winRateByEmotionalState,
    revengeTrades: 4,
    overtradingEvents: 6,
    timeseries,
  };
}

export function buildSession(sessionId: string) {
  const seed = hashString(sessionId);
  const date = new Date('2025-01-06T09:30:00Z');
  date.setDate(date.getDate() + (seed % 21));

  const assets = ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMD'];
  const trades = assets.map((asset, index) => {
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
      status: 'closed' as const,
      outcome: win ? 'win' : 'loss',
      pnl,
      planAdherence,
      emotionalState: ['calm', 'anxious', 'greedy', 'fearful', 'neutral'][index % 5] as SessionSummary['trades'][number]['emotionalState'],
      entryRationale: `Deterministic mock trade ${index + 1} for session ${sessionId}`,
    };
  });

  const winRate = trades.filter((trade) => trade.outcome === 'win').length / trades.length;
  const totalPnl = Number(trades.reduce((acc, trade) => acc + (trade.pnl || 0), 0).toFixed(2));

  return {
    sessionId,
    userId: DEMO_USER_ID,
    date: date.toISOString(),
    notes: 'Mock session generated for Vercel deployment',
    tradeCount: trades.length,
    winRate,
    totalPnl,
    trades,
  } satisfies SessionSummary;
}

export function writeJson(res: { statusCode?: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void }, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
