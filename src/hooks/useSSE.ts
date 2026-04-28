import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type SSEStatus = 'connecting' | 'open' | 'reconnecting' | 'error';

interface EventError extends Event {
  status?: number;
}

export function useSSE(url: string | null) {
  const [status, setStatus] = useState<SSEStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const sourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const backoffRef = useRef(1000);
  const currentUrl = useRef<string | null>(url);

  const closeSource = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
  }, []);

  const openSource = useCallback(() => {
    if (!url) {
      setStatus('error');
      setError('Missing SSE URL');
      return;
    }

    closeSource();
    setStatus('connecting');
    setError(null);

    try {
      const eventSource = new EventSource(url, { withCredentials: false });
      sourceRef.current = eventSource;

      eventSource.onopen = () => {
        backoffRef.current = 1000;
        setStatus('open');
        setError(null);
      };

      eventSource.onmessage = (event) => {
        setEvents((current) => [...current, event.data]);
      };

      eventSource.onerror = (event: Event) => {
        const eventError = event as EventError | Event;
        const isUnauthorized = 'status' in eventError && eventError.status === 401;
        
        if (isUnauthorized && eventSource.readyState === EventSource.CLOSED) {
          setStatus('error');
          setError('Authentication failed: Unable to connect to coaching service');
          closeSource();
          return;
        }

        setStatus((prev) => (prev === 'connecting' ? 'error' : 'reconnecting'));
        setError('Connection lost. Reconnecting...');
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          backoffRef.current = Math.min(backoffRef.current * 2, 30000);
          closeSource();
          openSource();
        }, backoffRef.current);
      };
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }

    currentUrl.current = url;
  }, [closeSource, url]);

  const retry = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    backoffRef.current = 1000;
    setEvents([]);
    setError(null);
    openSource();
  }, [openSource]);

  useEffect(() => {
    openSource();
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      closeSource();
    };
  }, [openSource, closeSource]);

  const latestEvent = events[events.length - 1] ?? null;
  const summary = useMemo(() => ({ status, error, events, latestEvent }), [status, error, events, latestEvent]);

  return {
    ...summary,
    retry,
  };
}
