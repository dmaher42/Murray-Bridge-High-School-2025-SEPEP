import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL = 60_000;

type PollingFn = () => Promise<unknown> | unknown;

export default function usePollingFetch(
  fn: PollingFn,
  intervalMs: number = DEFAULT_INTERVAL,
  enabled = true,
): void {
  const savedFn = useRef<PollingFn>(fn);

  useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      if (cancelled) return;
      try {
        await savedFn.current();
      } catch (error) {
        console.error('Polling fetch failed', error);
      }
    };

    void execute();

    const shouldPoll = enabled && Number.isFinite(intervalMs) && intervalMs >= 1000;
    if (!shouldPoll) {
      return () => {
        cancelled = true;
      };
    }

    const timer = window.setInterval(() => {
      void execute();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs]);
}
