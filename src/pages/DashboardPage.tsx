import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Heatmap from '../components/Heatmap';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import DashboardCoaching from '../components/DashboardCoaching';
import { getUserMetrics, getUserProfile } from '../services/api';
import { getUserIdFromToken } from '../utils/auth';
import type { UserMetrics, UserProfile } from '../types';
import styles from '../styles/DashboardPage.module.css';
import shared from '../styles/Shared.module.css';

// Predefined valid UUIDs for mock data
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
  'e1f2a3b4-c5d6-7890-5678-901234567890'
];

function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoachingSession, setSelectedCoachingSession] = useState<string | null>(null);
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) return; // Don't load data if no userId

    setLoading(true);
    setError(null);

    Promise.all([getUserProfile(userId), getUserMetrics(userId)])
      .then(([loadedProfile, loadedMetrics]) => {
        setProfile(loadedProfile);
        setMetrics(loadedMetrics);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const profileName = profile?.name || 'Trader';
  const profileInitials = useMemo(() => {
    return profileName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'TR';
  }, [profileName]);

  if (!userId) {
    const currentToken = localStorage.getItem('jwt');
    return (
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Authentication Required</h2>
        <p className={styles.smallText}>
          Please set a JWT token in localStorage to access the dashboard.
        </p>
        <p className={styles.smallText}>
          Current token status: {currentToken ? 'Token found' : 'No token set'}
        </p>
        <p className={styles.smallText}>
          Run this in your browser console:
          <br />
          <code>localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNDEyZjIzNi00ZWRjLTQ3YTItOGY1NC04NzYzYTZlZDJjZTgiLCJpYXQiOjE3NzcyODgwOTQsImV4cCI6MTc3NzM3NDQ5NCwicm9sZSI6InRyYWRlciIsIm5hbWUiOiJBbGV4IE1lcmNlciJ9.jaocuOfDvZXcpNHI9_jnFQ4ezJCuxlAk9TsWD0YiOEk')</code>
        </p>
        <button onClick={() => window.location.reload()} className={styles.button}>
          Refresh Page
        </button>
      </div>
    );
  }

  const summary = useMemo(() => {
    if (!metrics || !metrics.timeseries || metrics.timeseries.length === 0) return null;
    const total = metrics.timeseries.length;
    const average = total ? metrics.timeseries.reduce((acc, item) => acc + (item.planAdherenceScore || 0), 0) / total : 0;
    const winRate = total ? metrics.timeseries.reduce((acc, item) => acc + (item.winRate || 0), 0) / total : 0;
    return { total, average };
  }, [metrics]);

  const scores = useMemo(() => {
    if (!metrics) return [];
    return metrics.timeseries.map((item, index) => ({
      date: item.bucket,
      score: item.planAdherenceScore,
      sessionId: MOCK_SESSION_IDS[index % MOCK_SESSION_IDS.length], // Use valid UUID from predefined list
      sessionName: `Session ${new Date(item.bucket).toLocaleDateString()}`,
      summary: `Win rate: ${((item.winRate || 0) * 100).toFixed(1)}%, P&L: $${(item.totalPnl || 0).toFixed(2)}`,
    }));
  }, [metrics]);

  const chartPoints = useMemo(() => {
    return (metrics?.timeseries ?? []).slice(-7).map((item) => ({
      label: new Date(item.bucket).toLocaleDateString('en-US', { weekday: 'short' }),
      date: new Date(item.bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tradeCount: item.tradeCount,
      winRate: item.winRate,
      adherence: item.planAdherenceScore,
      pnl: item.totalPnl,
    }));
  }, [metrics]);

  const topPathologies = profile?.dominantPathologies?.length
    ? profile.dominantPathologies.slice(0, 3)
    : [
        { pathology: 'Overconfidence drift', confidence: 0.82, evidenceSessions: [], evidenceTrades: [] },
        { pathology: 'Late entry bias', confidence: 0.64, evidenceSessions: [], evidenceTrades: [] },
        { pathology: 'Reaction lag', confidence: 0.48, evidenceSessions: [], evidenceTrades: [] },
      ];

  const latestSessionId = scores[0]?.sessionId ?? null;

  useEffect(() => {
    if (!scores.length) return;
    setSelectedCoachingSession((current) => current ?? scores[0].sessionId);
  }, [scores]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!metrics || metrics.timeseries.length === 0) {
    return (
      <div className={shared.card}>
        <h2 className={shared.sectionTitle}>Behavioral Dashboard</h2>
        <p className={shared.smallText}>No session metrics are available yet.</p>
      </div>
    );
  }

  const handleDayClick = (sessionId: string) => {
    navigate(`/debrief/${sessionId}`);
  };

  const openLatestCoaching = () => {
    if (!latestSessionId) return;
    setSelectedCoachingSession(latestSessionId);
  };

  const openLatestDebrief = () => {
    if (!latestSessionId) return;
    navigate(`/debrief/${latestSessionId}`);
  };

  const averageWinRate = chartPoints.length
    ? chartPoints.reduce((acc, item) => acc + item.winRate, 0) / chartPoints.length
    : 0;

  const averagePnL = chartPoints.length
    ? chartPoints.reduce((acc, item) => acc + item.pnl, 0) / chartPoints.length
    : 0;

  const averageTradeCount = chartPoints.length
    ? chartPoints.reduce((acc, item) => acc + item.tradeCount, 0) / chartPoints.length
    : 0;

  const maxTradeCount = Math.max(1, ...chartPoints.map((item) => item.tradeCount));
  const maxAdherence = Math.max(1, ...chartPoints.map((item) => item.adherence), 1);
  const maxPnL = Math.max(1, ...chartPoints.map((item) => Math.abs(item.pnl)), 1);

  const sparklinePoints = chartPoints.map((item, index) => {
    const x = chartPoints.length > 1 ? (index / (chartPoints.length - 1)) * 100 : 0;
    const y = 100 - (Math.abs(item.pnl) / maxPnL) * 70 - 15;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = [
    '0,100',
    ...chartPoints.map((item, index) => {
      const x = chartPoints.length > 1 ? (index / (chartPoints.length - 1)) * 100 : 0;
      const y = 100 - (Math.max(0, item.pnl) / maxPnL) * 70 - 15;
      return `${x},${y}`;
    }),
    '100,100',
  ].join(' ');

  const gaugeValue = summary?.average ?? 0;
  const dashOffset = 226 - 226 * gaugeValue;

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar} aria-hidden="true">
            {profileInitials}
          </div>
          <div>
            <p className={styles.profileTitle}>{profileName}</p>
            <p className={styles.profileSubtitle}>{profile?.userId || userId}</p>
          </div>
          <div className={styles.pillRow}>
            <span className={styles.pill}>User Profile</span>
            <span className={styles.pill}>Live dashboard</span>
          </div>
        </div>

        <div className={styles.sidebarPanel}>
          <p className={styles.sidebarLabel}>Generated at</p>
          <p className={styles.sidebarValue}>{profile?.generatedAt ? new Date(profile.generatedAt).toLocaleString() : 'Live session data'}</p>
        </div>

        <div className={styles.sidebarPanel}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}>Sessions</p>
              <p className={styles.kpiValue}>{summary?.total ?? 0}</p>
            </div>
            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}>Adherence</p>
              <p className={styles.kpiValue}>{Math.round((summary?.average ?? 0) * 100)}%</p>
            </div>
            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}>Win rate</p>
              <p className={styles.kpiValue}>{Math.round(averageWinRate * 100)}%</p>
            </div>
            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}>P&L avg</p>
              <p className={styles.kpiValue}>${averagePnL.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className={styles.sidebarPanel}>
          <p className={styles.sidebarLabel}>Dominant signals</p>
          <ul className={styles.sidebarList}>
            {topPathologies.map((item) => (
              <li key={item.pathology} className={styles.pathologyItem}>
                <div className={styles.pathologyRow}>
                  <p className={styles.pathologyName}>{item.pathology}</p>
                  <span className={styles.pathologyScore}>{Math.round(item.confidence * 100)}%</span>
                </div>
                <div className={styles.pathologyTrack} aria-hidden="true">
                  <div className={styles.pathologyFill} style={{ width: `${Math.round(item.confidence * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actionStack}>
          <button type="button" className={styles.sidebarButton} onClick={openLatestCoaching} disabled={!latestSessionId}>
            Open latest coaching
          </button>
          <button
            type="button"
            className={`${styles.sidebarButton} ${styles.sidebarButtonSecondary}`}
            onClick={openLatestDebrief}
            disabled={!latestSessionId}
          >
            Start debrief flow
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <section className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Dashboard</p>
            <h1 className={styles.heroTitle}>Trading behavior overview with profile, coaching, and heatmap insights</h1>
            <p className={styles.heroText}>
              Use the profile rail to track the trader identity, scan the performance widgets, and jump directly into live coaching or the debrief flow.
            </p>
          </div>
          <div className={styles.heroActions}>
            <button type="button" className={styles.ghostButton} onClick={openLatestCoaching} disabled={!latestSessionId}>
              Live coaching
            </button>
            <button type="button" className={styles.primaryButton} onClick={openLatestDebrief} disabled={!latestSessionId}>
              View debrief
            </button>
          </div>
        </section>

        <section className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Sessions tracked</p>
            <p className={styles.metricValue}>{summary?.total ?? 0}</p>
            <p className={styles.metricMeta}>Across the current reporting window</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Average consistency</p>
            <p className={styles.metricValue}>{Math.round((summary?.average ?? 0) * 100)}%</p>
            <p className={styles.metricMeta}>Plan adherence over time</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Average win rate</p>
            <p className={styles.metricValue}>{Math.round(averageWinRate * 100)}%</p>
            <p className={styles.metricMeta}>Recent window trend</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Tilt index</p>
            <p className={styles.metricValue}>{metrics?.sessionTiltIndex.toFixed(2) ?? '0.00'}</p>
            <p className={styles.metricMeta}>Lower values indicate calmer execution</p>
          </article>
        </section>

        <section className={styles.panelGrid}>
          <article className={`${styles.panel} ${styles.chartWide}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Execution bars</h2>
                <p className={styles.panelSubtitle}>Comparing trade volume with plan adherence for the last seven sessions.</p>
              </div>
              <span className={styles.panelTag}>Trend view</span>
            </div>
            <div className={styles.barChart}>
              <div className={styles.barChartRow}>
                {chartPoints.map((item) => (
                  <div key={`${item.date}-${item.label}`} className={styles.barColumn}>
                    <div className={styles.barStack}>
                      <div className={styles.barTrack}>
                        <div className={styles.barFillPrimary} style={{ height: `${(item.tradeCount / maxTradeCount) * 100}%` }} />
                      </div>
                      <div className={styles.barTrack}>
                        <div className={styles.barFillSecondary} style={{ height: `${(item.adherence / maxAdherence) * 100}%` }} />
                      </div>
                    </div>
                    <span className={styles.barLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.barsLegend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendSwatch} />
                  Trade count
                </span>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendSwatch} ${styles.legendSwatchSecondary}`} />
                  Adherence score
                </span>
              </div>
            </div>
          </article>

          <article className={`${styles.panel} ${styles.chartMedium}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Plan adherence</h2>
                <p className={styles.panelSubtitle}>Circular progress and breakdown by the latest session bucket.</p>
              </div>
              <span className={styles.panelTag}>90-day view</span>
            </div>
            <div className={styles.donutCard}>
              <div className={styles.donutWrap} aria-label={`Plan adherence ${Math.round((summary?.average ?? 0) * 100)} percent`}>
                <svg viewBox="0 0 120 120" width="154" height="154">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="url(#adherenceGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 - 301.59 * (summary?.average ?? 0)}
                    transform="rotate(-90 60 60)"
                  />
                  <defs>
                    <linearGradient id="adherenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className={styles.donutText}>
                  <p className={styles.donutValue}>{Math.round((summary?.average ?? 0) * 100)}%</p>
                  <p className={styles.donutLabel}>Average adherence</p>
                </div>
              </div>
              <div className={styles.ringList}>
                <div className={styles.ringRow}>
                  <span className={styles.ringLabel}>Win rate</span>
                  <div className={styles.ringTrack}>
                    <div className={styles.ringFill} style={{ width: `${Math.round(averageWinRate * 100)}%` }} />
                  </div>
                  <span className={styles.ringValue}>{Math.round(averageWinRate * 100)}%</span>
                </div>
                <div className={styles.ringRow}>
                  <span className={styles.ringLabel}>Sessions</span>
                  <div className={styles.ringTrack}>
                    <div className={styles.ringFillAlt} style={{ width: `${Math.min(100, (summary?.total ?? 0) * 8)}%` }} />
                  </div>
                  <span className={styles.ringValue}>{summary?.total ?? 0}</span>
                </div>
                <div className={styles.ringRow}>
                  <span className={styles.ringLabel}>Tilt</span>
                  <div className={styles.ringTrack}>
                    <div className={styles.ringFillWarm} style={{ width: `${Math.max(8, Math.min(100, (metrics?.sessionTiltIndex ?? 0) * 20))}%` }} />
                  </div>
                  <span className={styles.ringValue}>{metrics?.sessionTiltIndex.toFixed(2) ?? '0.00'}</span>
                </div>
              </div>
            </div>
          </article>

          <article className={`${styles.panel} ${styles.chartMedium}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Performance gauge</h2>
                <p className={styles.panelSubtitle}>A quick read on the current consistency score.</p>
              </div>
              <span className={styles.panelTag}>Signal</span>
            </div>
            <div className={styles.chartShell}>
              <svg className={styles.sparklineChart} viewBox="0 0 220 160" role="img" aria-label="Performance gauge chart">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <path
                  d="M30 120 A80 80 0 0 1 190 120"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M30 120 A80 80 0 0 1 190 120"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray="226"
                  strokeDashoffset={dashOffset}
                />
                <circle
                  cx={110 + Math.cos(Math.PI * (1 - gaugeValue)) * 72}
                  cy={120 - Math.sin(Math.PI * (1 - gaugeValue)) * 72}
                  r="7"
                  fill="#f8fafc"
                  stroke="#0f172a"
                  strokeWidth="3"
                />
                <line x1="110" y1="120" x2={110 + Math.cos(Math.PI * (1 - gaugeValue)) * 72} y2={120 - Math.sin(Math.PI * (1 - gaugeValue)) * 72} stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div className={styles.chartShell}>
                <p className={styles.metricValue} style={{ margin: 0 }}>{Math.round(gaugeValue * 100)}%</p>
                <p className={styles.metricMeta}>Current consistency score with the latest session blend.</p>
              </div>
            </div>
          </article>

          <article className={`${styles.panel} ${styles.chartWide}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>P&L trend</h2>
                <p className={styles.panelSubtitle}>Area and line view across the selected reporting window.</p>
              </div>
              <span className={styles.panelTag}>Momentum</span>
            </div>
            <svg className={styles.sparklineChart} viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Profit and loss trend chart">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(37, 99, 235, 0.65)" />
                  <stop offset="100%" stopColor="rgba(37, 99, 235, 0.06)" />
                </linearGradient>
              </defs>
              <path d={`${areaPoints} Z`} fill="url(#areaGradient)" />
              <polyline points={sparklinePoints} fill="none" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {chartPoints.map((item, index) => {
                const x = chartPoints.length > 1 ? (index / (chartPoints.length - 1)) * 100 : 0;
                const y = 100 - (Math.abs(item.pnl) / maxPnL) * 70 - 15;
                return <circle key={`${item.date}-${index}`} cx={x} cy={y} r="2.4" fill="#f8fafc" />;
              })}
            </svg>
          </article>
        </section>

        {selectedCoachingSession && (
          <section className={styles.chartFull}>
            <DashboardCoaching sessionId={selectedCoachingSession} />
          </section>
        )}

        <section className={styles.panelGrid}>
          <article className={`${styles.panel} ${styles.chartWide}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Behavioral heatmap</h2>
                <p className={styles.panelSubtitle}>Hover a day to inspect session details and click to open the debrief flow.</p>
              </div>
              <span className={styles.panelTag}>90 days</span>
            </div>
            <Heatmap scores={scores.slice(-90)} onDayClick={handleDayClick} />
          </article>

          <article className={`${styles.panel} ${styles.chartMedium}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Recent sessions</h2>
                <p className={styles.panelSubtitle}>Select a session to view its coaching or debrief detail.</p>
              </div>
              <span className={styles.panelTag}>Latest</span>
            </div>
            <ul className={styles.sessionList}>
              {scores.slice(0, 5).map((item) => (
                <li key={item.sessionId} className={styles.sessionItem}>
                  <div className={styles.sessionTopRow}>
                    <div>
                      <p className={styles.sessionName}>{item.sessionName}</p>
                      <p className={styles.sessionMeta}>{item.date}</p>
                    </div>
                    <span className={styles.panelTag}>{Math.round((item.score || 0) * 100)}%</span>
                  </div>
                  <p className={styles.sessionMeta}>{item.summary}</p>
                  <div className={styles.sessionActions}>
                    <button type="button" className={styles.sessionButton} onClick={() => handleDayClick(item.sessionId)}>
                      Open debrief
                    </button>
                    <button type="button" className={styles.sessionButton} onClick={() => setSelectedCoachingSession(item.sessionId)}>
                      Coaching
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
