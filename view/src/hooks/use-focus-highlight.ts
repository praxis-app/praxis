import { type RefObject, useEffect, useRef } from 'react';

export const FOCUS_HIGHLIGHT_DURATION_MS = 2000;

const SETTLE_DELAY_MS = 100;

interface Options {
  containerRef: RefObject<HTMLElement | null>;

  /** Selector for the element to reveal, or null when nothing is focused */
  targetSelector: string | null;

  /** Distinguishes repeat requests for the same target, such as a route key */
  requestKey?: string;

  /** Re-runs the lookup as the surrounding content loads */
  revision?: unknown;

  block?: ScrollLogicalPosition;
  onHandled?: () => void;
}

/** Waits for surrounding content to settle so the target does not drift away */
export const useFocusHighlight = ({
  containerRef,
  targetSelector,
  requestKey,
  revision,
  block = 'start',
  onHandled,
}: Options) => {
  const lastHandledRequestRef = useRef<string | null>(null);

  useEffect(() => {
    if (!targetSelector) {
      lastHandledRequestRef.current = null;
      return;
    }
    const container = containerRef.current;
    const target = container?.querySelector<HTMLElement>(targetSelector);
    if (!container || !target) {
      return;
    }

    const currentRequestKey = requestKey || targetSelector;
    if (lastHandledRequestRef.current === currentRequestKey) {
      return;
    }

    target.focus({ preventScroll: true });

    let settleTimer: number;
    const revealOnce = () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      lastHandledRequestRef.current = currentRequestKey;
      target.dataset.focusHighlight = 'true';
      window.setTimeout(() => {
        delete target.dataset.focusHighlight;
      }, FOCUS_HIGHLIGHT_DURATION_MS);
      target.scrollIntoView({ behavior: 'smooth', block });
      onHandled?.();
    };
    const scheduleReveal = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(revealOnce, SETTLE_DELAY_MS);
    };
    const resizeObserver = new ResizeObserver(scheduleReveal);
    const mutationObserver = new MutationObserver(scheduleReveal);

    resizeObserver.observe(target);
    for (const child of container.children) {
      resizeObserver.observe(child);
    }
    mutationObserver.observe(container, { childList: true, subtree: true });
    scheduleReveal();

    return () => {
      window.clearTimeout(settleTimer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [
    block,
    containerRef,
    onHandled,
    requestKey,
    revision,
    targetSelector,
  ]);
};
