import { useRef } from 'react';

/**
 * Runs a dropdown menu action after the menu finishes closing, so actions that
 * change the layout don't make the closing menu flicker
 */
export const useDeferredMenuAction = () => {
  const pendingActionRef = useRef<(() => void) | null>(null);

  const deferUntilClosed = (action: () => void) => () => {
    pendingActionRef.current = action;
  };

  const runPendingAction = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  };

  return { deferUntilClosed, runPendingAction };
};
