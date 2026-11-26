import { type CSSProperties } from 'react';

export const getAnimationStyle = (
  keyframes: string,
  durationMs: number,
  easing: string,
  delayMs = 0,
): CSSProperties => ({
  animation: `${keyframes} ${durationMs}ms ${easing} ${delayMs}ms both`,
});
