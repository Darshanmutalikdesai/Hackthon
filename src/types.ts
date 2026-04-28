export type Trade = {
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
  emotionalState?: EmotionTag;
  entryRationale?: string;
};

export type Session = {
  sessionId: string;
  userId: string;
  date: string;
  notes?: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  trades: Trade[];
};

export type EmotionTag = 'calm' | 'anxious' | 'greedy' | 'fearful' | 'neutral';

export type UserProfile = {
  userId: string;
  name?: string;
  generatedAt?: string;
  dominantPathologies?: Array<{
    pathology: string;
    confidence: number;
    evidenceSessions: string[];
    evidenceTrades: string[];
  }>;
};

export type SessionScore = {
  date: string;
  score: number;
  sessionId: string;
  sessionName?: string;
  summary?: string;
};

export type UserMetrics = {
  userId: string;
  granularity: string;
  from: string;
  to: string;
  planAdherenceScore: number;
  sessionTiltIndex: number;
  winRateByEmotionalState?: Record<string, { wins: number; losses: number; winRate: number }>;
  revengeTrades?: number;
  overtradingEvents?: number;
  timeseries: Array<{
    bucket: string;
    tradeCount: number;
    winRate: number;
    totalPnl: number;
    planAdherenceScore: number;
  }>;
};
