import { useEffect, useRef } from 'react';

/**
 * Calls callback on mount and then every intervalMs while enabled.
 * Used for instant chat / auto-refresh (e.g. polling messages).
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  enabled: boolean
): void {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current();
    };

    tick(); // run immediately
    intervalRef.current = setInterval(tick, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs]);
}
