import { useCallback, useEffect, useRef } from 'react';

// Attached images hold a fixed-height placeholder until they resolve, so the
// container keeps changing height for a moment after new content lands
const CONTENT_SETTLE_MS = 3000;

export const useScrollToBottom = <T extends HTMLElement>() => {
  const containerRef = useRef<T | null>(null);
  const settleUntilRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const scheduleScroll = useCallback((behavior: ScrollBehavior) => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const container = containerRef.current;
      container?.scrollTo({ top: container.scrollHeight, behavior });
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    settleUntilRef.current = Date.now() + CONTENT_SETTLE_MS;
    scheduleScroll('smooth');
  }, [scheduleScroll]);

  // Re-pin to the bottom once late-loading content invalidates the height the
  // original scroll was measured against
  const handleContentLoad = useCallback(() => {
    if (Date.now() > settleUntilRef.current) {
      return;
    }
    scheduleScroll('auto');
  }, [scheduleScroll]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  return { containerRef, scrollToBottom, handleContentLoad };
};
