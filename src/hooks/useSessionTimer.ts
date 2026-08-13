import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

function computeRemaining(startedAt: number | null, durationSeconds: number): number {
  if (startedAt == null) return durationSeconds;
  const elapsed = (Date.now() - startedAt) / 1000;
  return Math.max(0, Math.ceil(durationSeconds - elapsed));
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Derives the countdown from the session's start timestamp rather than decrementing
 * a counter, so the correct value survives backgrounding, JS timer throttling, or the
 * app being relaunched mid-session (per the design handoff's resilience note).
 */
export function useSessionTimer() {
  const isRunning = useAppStore((s) => s.isRunning);
  const sessionStartedAt = useAppStore((s) => s.sessionStartedAt);
  const sessionDurationSeconds = useAppStore((s) => s.sessionDurationSeconds);
  const finishSession = useAppStore((s) => s.finishSession);

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    computeRemaining(sessionStartedAt, sessionDurationSeconds),
  );

  useEffect(() => {
    setRemainingSeconds(computeRemaining(sessionStartedAt, sessionDurationSeconds));
    if (!isRunning) return;

    const tick = () => {
      const remaining = computeRemaining(sessionStartedAt, sessionDurationSeconds);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        finishSession();
      }
    };

    const interval = setInterval(tick, 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isRunning, sessionStartedAt, sessionDurationSeconds, finishSession]);

  return { remainingSeconds, formatted: formatCountdown(remainingSeconds) };
}
