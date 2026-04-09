import { useCallback, useEffect, useRef } from 'react';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  onStop?: () => void;
}

export function usePolling(
  callback: () => Promise<boolean | void>,
  { interval = 3000, enabled = true, onStop }: UsePollingOptions = {},
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onStop?.();
  }, [onStop]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      const shouldStop = await callbackRef.current();
      if (shouldStop || cancelled) return;
      timeoutRef.current = setTimeout(poll, interval);
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, interval]);

  return { stop };
}
