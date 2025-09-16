import { useEffect } from 'react';

export function usePollingFetch(
  fn: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean,
): void {
  useEffect(() => {
    const invoke = () => {
      try {
        const result = fn();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error('Polling fetch failed:', error);
          });
        }
      } catch (error) {
        console.error('Polling fetch failed:', error);
      }
    };

    if (!enabled) {
      invoke();
      return;
    }

    invoke();
    const id = window.setInterval(invoke, intervalMs);
    return () => window.clearInterval(id);
  }, [fn, intervalMs, enabled]);
}

export default usePollingFetch;
