import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Heatmap from '../components/Heatmap';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import DashboardCoaching from '../components/DashboardCoaching';
import { getUserMetrics, getUserProfile } from '../services/api';
import { getUserIdFromToken } from '../utils/auth';
import type { SessionScore, UserMetrics, UserProfile } from '../types';
import styles from '../styles/Shared.module.css';

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
        // Set initial coaching session to most recent
        if (loadedMetrics.timeseries.length > 0) {
          const firstSessionId = MOCK_SESSION_IDS[0];
          setSelectedCoachingSession(firstSessionId);
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, [userId]);

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

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!metrics || metrics.timeseries.length === 0) {
    return (
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Behavioral Dashboard</h2>
        <p className={styles.smallText}>No session metrics are available yet.</p>
      </div>
    );
  }

  const handleDayClick = (sessionId: string) => {
    navigate(`/debrief/${sessionId}`);
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#94a3b8' }}>Welcome back,</p>
            <h1 style={{ margin: '6px 0 0', fontSize: '1.9rem' }}>{profile?.name || 'Trader'}</h1>
          </div>
          <div style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
            <p className={styles.smallText}>Sessions tracked</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{summary?.total ?? 0}</p>
            <p className={styles.smallText}>Average consistency {Math.round((summary?.average ?? 0) * 100)}%</p>
          </div>
        </div>
      </section>

      {selectedCoachingSession && (
        <section>
          <DashboardCoaching sessionId={selectedCoachingSession} />
        </section>
      )}

      <section className={styles.card}>
        <div style={{ display: 'grid', gap: 10 }}>
          <h2 className={styles.sectionTitle}>Behavioural Heatmap</h2>
          <p className={styles.smallText}>Hover a day to inspect session details and click to open the debrief flow.</p>
          <Heatmap scores={scores.slice(-90)} onDayClick={handleDayClick} />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Recent Sessions</h2>
        <ul className={styles.listReset}>
          {scores.slice(0, 4).map((item) => (
            <li key={item.sessionId} style={{ padding: '12px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleDayClick(item.sessionId)}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    color: '#f8fafc',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span>{item.sessionName}</span>
                    <span style={{ color: '#60a5fa' }}>{Math.round((item.score || 0) * 100)}%</span>
                  </div>
                  <p className={styles.smallText} style={{ margin: '8px 0 0' }}>{item.summary}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCoachingSession(item.sessionId)}
                  style={{
                    padding: '8px 12px',
                    border: selectedCoachingSession === item.sessionId ? '1px solid rgba(59, 130, 246, 0.8)' : '1px solid rgba(148, 163, 184, 0.24)',
                    background: selectedCoachingSession === item.sessionId ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.06)',
                    color: '#e2e8f0',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  title="Load coaching for this session"
                >
                  💡 Coach
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default DashboardPage;
