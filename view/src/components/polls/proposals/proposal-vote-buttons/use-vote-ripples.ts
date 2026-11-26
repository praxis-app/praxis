import { VOTE_RIPPLE } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { type VoteRipple } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { useEffect, useRef, useState } from 'react';

export const useVoteRipples = () => {
  const [ripples, setRipples] = useState<VoteRipple[]>([]);

  const nextIdRef = useRef(0);
  const heldRef = useRef<{ id: number; startedAt: number } | null>(null);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const schedule = (callback: () => void, delayMs: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delayMs);
    timersRef.current.add(timer);
  };

  const fadeOut = (id: number, startedAt: number) => {
    const remainingLitMs = Math.max(
      0,
      VOTE_RIPPLE.minLitMs - (performance.now() - startedAt),
    );
    schedule(() => {
      setRipples((current) =>
        current.map((ripple) =>
          ripple.id === id ? { ...ripple, isReleased: true } : ripple,
        ),
      );
      schedule(
        () =>
          setRipples((current) => current.filter((ripple) => ripple.id !== id)),
        VOTE_RIPPLE.fadeMs,
      );
    }, remainingLitMs);
  };

  const release = () => {
    if (!heldRef.current) {
      return;
    }
    fadeOut(heldRef.current.id, heldRef.current.startedAt);
    heldRef.current = null;
  };

  const press = (
    button: HTMLElement,
    clientX?: number,
    clientY?: number,
    isHeld = true,
  ) => {
    release();
    const rect = button.getBoundingClientRect();
    const x = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const y = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const size =
      2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
    const id = nextIdRef.current++;
    const startedAt = performance.now();

    setRipples((current) => [
      ...current,
      { id, x, y, size, isReleased: false },
    ]);
    if (isHeld) {
      heldRef.current = { id, startedAt };
    } else {
      fadeOut(id, startedAt);
    }
  };

  return { ripples, press, release };
};
