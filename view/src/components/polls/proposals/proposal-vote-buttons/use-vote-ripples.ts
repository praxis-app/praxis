import { useRef, useState } from 'react';

const MIN_PEAK_MS = 360;

interface VoteRipple {
  id: number;
  x: number;
  y: number;
  size: number;
  fadeDelayMs: number | null;
}

export const useVoteRipples = () => {
  const [ripples, setRipples] = useState<VoteRipple[]>([]);

  const nextIdRef = useRef(0);
  const heldRef = useRef<{ id: number; startedAt: number } | null>(null);

  const fadeOut = (id: number, fadeDelayMs: number) => {
    setRipples((current) =>
      current.map((ripple) =>
        ripple.id === id ? { ...ripple, fadeDelayMs } : ripple,
      ),
    );
  };

  const release = () => {
    if (!heldRef.current) {
      return;
    }
    const { id, startedAt } = heldRef.current;
    heldRef.current = null;
    fadeOut(id, Math.max(0, MIN_PEAK_MS - (performance.now() - startedAt)));
  };

  const press = (
    button: HTMLElement,
    clientX?: number,
    clientY?: number,
    isHeld = true,
  ) => {
    release();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = button.getBoundingClientRect();
    const x = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const y = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const size =
      2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
    const id = nextIdRef.current++;

    setRipples((current) => [
      ...current,
      { id, x, y, size, fadeDelayMs: isHeld ? null : MIN_PEAK_MS },
    ]);
    if (isHeld) {
      heldRef.current = { id, startedAt: performance.now() };
    }
  };

  const remove = (id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  };

  return { ripples, press, release, remove };
};
