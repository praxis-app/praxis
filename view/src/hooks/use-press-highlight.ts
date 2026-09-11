import { useCallback, useEffect, useRef, useState } from 'react';

const PRESS_DELAY_MS = 50;

/**
 * Highlights an element just after a touch press begins, so a long press feels
 * responsive well before its menu opens. Cancels on the same events Radix uses
 * to cancel its long press, keeping the highlight and the menu in step
 */
export const usePressHighlight = () => {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef(0);

  const cancelPress = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setIsPressed(false);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const pressHandlers = {
    onPointerDown: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') {
        return;
      }
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(
        () => setIsPressed(true),
        PRESS_DELAY_MS,
      );
    },
    onPointerMove: cancelPress,
    onPointerUp: cancelPress,
    onPointerCancel: cancelPress,
  };

  return { isPressed, pressHandlers };
};
