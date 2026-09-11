import { useEffect, useRef } from 'react';

/**
 * Runs `resync` whenever the client comes back from being away — the tab
 * becoming visible again, or the websocket reopening after a drop. Both
 * signals mean cached data may have missed pushes while nobody was listening.
 *
 * The callback is held in a ref, so an inline arrow will not re-run the effects
 */
export const useResyncOnReturn = (readyState: number, resync: () => void) => {
  const previousReadyState = useRef<number | undefined>(undefined);
  const resyncRef = useRef(resync);

  useEffect(() => {
    resyncRef.current = resync;
  });

  useEffect(() => {
    const reopened =
      previousReadyState.current !== undefined &&
      previousReadyState.current !== WebSocket.OPEN &&
      readyState === WebSocket.OPEN;

    previousReadyState.current = readyState;
    if (reopened) {
      resyncRef.current();
    }
  }, [readyState]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resyncRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
};
