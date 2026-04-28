import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '../types';
import { getSession, postSessionDebrief } from '../services/api';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorState from './ErrorState';
import TradeList from './TradeList';
import styles from '../styles/DebriefFlow.module.css';

const STEP_COUNT = 5;
const STEP_NAMES = ['Trade Replay', 'Emotional Feedback', 'Plan Adherence', 'Overall Mood', 'Key Takeaway'];

function DebriefFlowController({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [tradeReplay, setTradeReplay] = useState('');
  const [emotionalFeedback, setEmotionalFeedback] = useState('');
  const [planAdherence, setPlanAdherence] = useState(3);
  const [overallMood, setOverallMood] = useState<'calm' | 'anxious' | 'greedy' | 'fearful' | 'neutral'>('neutral');
  const [takeaway, setTakeaway] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const stepRefs = [useRef<HTMLDivElement | null>(null), useRef<HTMLDivElement | null>(null), useRef<HTMLDivElement | null>(null), useRef<HTMLDivElement | null>(null), useRef<HTMLDivElement | null>(null)];

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSession(sessionId)
      .then((result) => {
        setSession(result);
      })
      .catch((err) => setError(err.message || 'Unable to load session'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    const current = stepRefs[step - 1]?.current;
    // Focus the step container so keyboard navigation works
    current?.focus();
  }, [step]);



  // Keyboard navigation with better support

  const canAdvanceFromStep = useCallback((currentStep: number): boolean => {
    switch (currentStep) {
      case 1: return tradeReplay.trim().length > 10; // Trade Replay - min 10 chars
      case 2: return emotionalFeedback.trim().length > 10; // Emotional Feedback - min 10 chars
      case 3: return planAdherence > 0; // Plan Adherence - rating selected
      case 4: return true; // Overall Mood - any selection works
      case 5: return takeaway.trim().length > 10; // Key Takeaway - min 10 chars
      default: return false;
    }
  }, [tradeReplay, emotionalFeedback, planAdherence, takeaway]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow key navigation
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (canAdvanceFromStep(step)) {
          setCompletedSteps(prev => new Set(prev).add(step));
          setStep((prev) => Math.min(prev + 1, STEP_COUNT));
        }
      } else if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setStep((prev) => Math.max(prev - 1, 1));
      }
      // Support Ctrl+Enter / Cmd+Enter to submit on last step
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && step === STEP_COUNT) {
        e.preventDefault();
        if (takeaway.trim().length >= 10) {
          handleSubmit();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, canAdvanceFromStep, takeaway]);

  const handleRetry = () => {
    setStep(1);
    setSession(null);
    setLoading(true);
    setError(null);
    getSession(sessionId)
      .then((result) => {
        setSession(result);
      })
      .catch((err) => setError(err.message || 'Unable to load session'))
      .finally(() => setLoading(false));
  };

  const handleNext = () => {
    if (canAdvanceFromStep(step)) {
      setCompletedSteps(prev => new Set(prev).add(step));
      setStep((prev) => Math.min(prev + 1, STEP_COUNT));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      await postSessionDebrief(session.sessionId, {
        overallMood,
        keyLesson: takeaway,
        planAdherenceRating: planAdherence,
      });
      setSubmitSuccess(true);
    } catch (err) {
      setError((err as Error).message || 'Unable to submit debrief');
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitle = useMemo(() => {
    return STEP_NAMES[step - 1];
  }, [step]);

  const sessionStats = useMemo(() => {
    if (!session) return null;

    const tradeCount = session.trades.length;
    const winningTrades = session.trades.filter((trade) => trade.outcome === 'win').length;
    const closedTrades = session.trades.filter((trade) => trade.status === 'closed');
    const averagePnl = tradeCount ? session.trades.reduce((acc, trade) => acc + (trade.pnl || 0), 0) / tradeCount : 0;
    const averagePlanAdherence = tradeCount
      ? session.trades.reduce((acc, trade) => acc + (trade.planAdherence || 0), 0) / tradeCount
      : 0;

    return {
      tradeCount,
      winningTrades,
      closedTrades: closedTrades.length,
      averagePnl,
      averagePlanAdherence,
    };
  }, [session]);

  const isStepComplete = (stepNum: number): boolean => {
    return completedSteps.has(stepNum);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (!session) {
    return (
      <div className={styles.emptyState}>
        <p>No session was found. Try a different session ID.</p>
      </div>
    );
  }

  return (
    <div className={styles.flowShell}>
      <section className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p className={styles.stepLabel}>Session Statistics</p>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 8 }}>{session.sessionId}</h2>
            <p className={styles.smallText} style={{ margin: 0 }}>
              {new Date(session.date).toLocaleString()} • User {session.userId}
            </p>
          </div>
          <div style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
            <p className={styles.smallText} style={{ margin: 0 }}>Win rate {Math.round(session.winRate * 100)}%</p>
            <p className={styles.smallText} style={{ margin: 0 }}>Total P&L ${session.totalPnl.toFixed(2)}</p>
            <p className={styles.smallText} style={{ margin: 0 }}>Trades {sessionStats?.tradeCount ?? 0}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 18 }}>
          <div className={styles.card}>
            <p className={styles.smallText} style={{ margin: 0 }}>Closed trades</p>
            <p style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{sessionStats?.closedTrades ?? 0}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.smallText} style={{ margin: 0 }}>Winning trades</p>
            <p style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{sessionStats?.winningTrades ?? 0}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.smallText} style={{ margin: 0 }}>Avg. P&L</p>
            <p style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>${(sessionStats?.averagePnl ?? 0).toFixed(2)}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.smallText} style={{ margin: 0 }}>Avg. plan adherence</p>
            <p style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>
              {(sessionStats?.averagePlanAdherence ?? 0).toFixed(1)}/5
            </p>
          </div>
        </div>
      </section>

      <TradeList trades={session.trades} />

      {/* Progress Bar */}
      <div style={{ 
        display: 'flex', 
        gap: 8,
        marginBottom: 16
      }}>
        {Array.from({ length: STEP_COUNT }).map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: idx + 1 === step 
                ? 'rgba(59, 130, 246, 0.8)' 
                : idx + 1 < step 
                ? 'rgba(16, 185, 129, 0.6)' 
                : 'rgba(148, 163, 184, 0.2)',
              transition: 'all 0.3s ease',
            }}
            title={`Step ${idx + 1}: ${STEP_NAMES[idx]}`}
          />
        ))}
      </div>

      <div className={styles.stepHeader}>
        <p className={styles.stepLabel}>Step {step} of {STEP_COUNT}</p>
        <h1 className={styles.stepTitle}>{stepTitle}</h1>
      </div>

      <div className={styles.stepContent}>
        {step === 1 && (
          <div ref={stepRefs[0]} tabIndex={-1}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Trade Replay</h2>
              <p className={styles.smallText}>Describe how the trade played out. What was your entry and exit strategy?</p>
              <textarea
                value={tradeReplay}
                onChange={(e) => setTradeReplay(e.target.value)}
                placeholder="Walk through your trade from entry to exit. Include prices, timing, and any adjustments you made."
                rows={6}
                aria-label="Trade replay description. Minimum 10 characters required."
                aria-describedby="trade-replay-hint"
                style={{
                  width: '100%',
                  borderRadius: 18,
                  border: tradeReplay.trim().length > 0 ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.18)',
                  padding: 16,
                  background: 'rgba(15, 23, 42, 0.96)',
                  color: '#f8fafc',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                }}
              />
              <div id="trade-replay-hint">
                {tradeReplay.trim().length > 0 && tradeReplay.trim().length < 10 && (
                  <span style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: 8, display: 'block' }}>({tradeReplay.trim().length}/10 characters minimum)</span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div ref={stepRefs[1]} tabIndex={-1}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Emotional Feedback</h2>
              <p className={styles.smallText}>How did you feel emotionally during this trade? Describe your state of mind and any emotions you experienced.</p>
              <textarea
                value={emotionalFeedback}
                onChange={(e) => setEmotionalFeedback(e.target.value)}
                placeholder="Share your emotional experience - were you calm, anxious, greedy, fearful? How did your emotions affect your decisions?"
                rows={6}
                aria-label="Emotional feedback description. Minimum 10 characters required."
                aria-describedby="emotional-feedback-hint"
                style={{
                  width: '100%',
                  borderRadius: 18,
                  border: emotionalFeedback.trim().length > 0 ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.18)',
                  padding: 16,
                  background: 'rgba(15, 23, 42, 0.96)',
                  color: '#f8fafc',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                }}
              />
              <div id="emotional-feedback-hint">
                {emotionalFeedback.trim().length > 0 && emotionalFeedback.trim().length < 10 && (
                  <span style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: 8, display: 'block' }}>({emotionalFeedback.trim().length}/10 characters minimum)</span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div ref={stepRefs[2]} tabIndex={-1}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Plan Adherence</h2>
              <p className={styles.smallText}>Select how closely you stayed with your trading plan (1 = Low, 5 = Perfect).</p>
              <div className={styles.buttonGroup} role="radiogroup" aria-label="Plan adherence rating from 1 to 5">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    type="button"
                    key={rating}
                    className={styles.actionButton}
                    aria-pressed={planAdherence === rating}
                    aria-label={`Rating ${rating}${rating === 1 ? ' - Low adherence' : rating === 5 ? ' - Perfect adherence' : ''}`}
                    onClick={() => setPlanAdherence(rating)}
                    style={{
                      background: planAdherence === rating ? 'rgba(16, 185, 129, 0.18)' : undefined,
                      borderColor: planAdherence === rating ? 'rgba(16, 185, 129, 0.8)' : undefined,
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div ref={stepRefs[3]} tabIndex={-1}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Overall Mood</h2>
              <p className={styles.smallText}>How did you feel during this trading session overall?</p>
              <div className={styles.buttonGroup} role="radiogroup" aria-label="Overall mood selection. Choose one: Calm, Anxious, Greedy, Fearful, or Neutral">
                {['calm', 'anxious', 'greedy', 'fearful', 'neutral'].map((mood) => (
                  <button
                    type="button"
                    key={mood}
                    className={styles.actionButton}
                    aria-pressed={overallMood === mood}
                    aria-label={`Select ${mood} mood`}
                    onClick={() => setOverallMood(mood as typeof overallMood)}
                    style={{
                      background: overallMood === mood ? 'rgba(59, 130, 246, 0.18)' : undefined,
                      borderColor: overallMood === mood ? 'rgba(59, 130, 246, 0.8)' : undefined,
                      cursor: 'pointer',
                    }}
                  >
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div ref={stepRefs[4]} tabIndex={-1}>
            <div className={styles.cardForm}>
              <h2 className={styles.sectionTitle}>Key Takeaway</h2>
              <p className={styles.smallText}>Summarize the most important lesson from this session. (Min 10 characters)</p>
              <textarea
                value={takeaway}
                onChange={(event) => setTakeaway(event.target.value)}
                placeholder="Summarize the most important lesson from this session."
                rows={8}
                aria-label="Key takeaway summary. Minimum 10 characters required to submit."
                aria-describedby="takeaway-hint"
                style={{
                  width: '100%',
                  borderRadius: 18,
                  border: takeaway.trim().length > 0 ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.18)',
                  padding: 16,
                  background: 'rgba(15, 23, 42, 0.96)',
                  color: '#f8fafc',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                }}
              />
              <div id="takeaway-hint">
                {takeaway.trim().length > 0 && takeaway.trim().length < 10 && (
                  <span style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: 8, display: 'block' }}>({takeaway.trim().length}/10 characters minimum)</span>
                )}
              </div>
              <div className={styles.footerActions}>
                <button 
                  type="button" 
                  className={styles.actionButton} 
                  onClick={handleSubmit} 
                  disabled={submitting || takeaway.trim().length < 10}
                  aria-label="Submit debrief. Keyboard shortcut: Ctrl+Enter"
                >
                  {submitting ? 'Submitting…' : 'Submit Debrief'}
                </button>
                {submitSuccess && <span style={{ color: '#86efac' }}>✓ Submitted successfully.</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.navigationRow}>
        <button 
          type="button" 
          className={styles.actionButton} 
          onClick={handleBack} 
          disabled={step === 1}
          aria-label={`Go to previous step${step > 1 ? `: Step ${step - 1} of ${STEP_COUNT}` : ''}`}
          title="Keyboard: ← Arrow Left or click to go back"
        >
          ← Back
        </button>
        <div className={styles.buttonGroup}>
          {step < STEP_COUNT ? (
            <button 
              type="button" 
              className={styles.actionButton} 
              onClick={handleNext}
              disabled={!canAdvanceFromStep(step)}
              aria-label={`Go to next step${step < STEP_COUNT ? `: Step ${step + 1} of ${STEP_COUNT}` : ''}`}
              title="Keyboard: → Arrow Right or click to advance. Ctrl+Enter to submit on final step."
              style={{
                opacity: !canAdvanceFromStep(step) ? 0.5 : 1,
                cursor: !canAdvanceFromStep(step) ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          ) : (
            <button 
              type="button" 
              className={styles.actionButton} 
              onClick={() => navigate('/')}
              aria-label="Return to dashboard"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DebriefFlowController;
