import {
  REDUCED_MOTION_CLASS_NAME,
  VOTE_EASINGS,
  VOTE_FLOURISH,
  VOTE_GLYPHS,
  VOTE_MOTION_DURATIONS_MS,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import {
  type VoteAnimation,
  type VoteMotion,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { cn } from '@/lib/shared.utils';
import { type VoteType } from '@/types/vote.types';
import { type CSSProperties, useId } from 'react';

interface Props {
  voteType: VoteType;
  isSelected: boolean;
  animation?: VoteAnimation;
}

const FLOURISH_STROKE_CLASS_NAME = cn(
  'stroke-vote-accent',
  REDUCED_MOTION_CLASS_NAME,
);

const getAnimationStyle = (
  keyframes: string,
  durationMs: number,
  easing: string,
  delayMs = 0,
): CSSProperties => ({
  animation: `${keyframes} ${durationMs}ms ${easing} ${delayMs}ms both`,
});

const getMotionStyle = (voteType: VoteType, motion: VoteMotion) => {
  const durationMs = VOTE_MOTION_DURATIONS_MS[motion];
  if (motion === 'select') {
    const { selectKeyframes, selectEasing } = VOTE_GLYPHS[voteType];
    return getAnimationStyle(
      selectKeyframes,
      durationMs,
      VOTE_EASINGS[selectEasing],
    );
  }
  return getAnimationStyle(`vote-${motion}`, durationMs, VOTE_EASINGS.firm);
};

const getFlourishStyle = (keyframes: string) =>
  getAnimationStyle(
    keyframes,
    VOTE_FLOURISH.durationMs,
    VOTE_FLOURISH.easing,
    VOTE_FLOURISH.delayMs,
  );

export const VoteIcon = ({ voteType, isSelected, animation }: Props) => {
  const maskId = `vote-glyph-${useId().replace(/[^\w-]/g, '')}`;

  const motion = animation?.motion ?? null;
  const { shapePath, glyphPaths, flourish } = VOTE_GLYPHS[voteType];

  const renderGlyph = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 overflow-visible"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={-2}
          y={-2}
          width={28}
          height={28}
        >
          <rect
            x={-2}
            y={-2}
            width={28}
            height={28}
            fill="white"
            stroke="none"
          />
          {glyphPaths.map((path) => (
            <path key={path} d={path} stroke="black" strokeWidth={2.5} />
          ))}
        </mask>
      </defs>
      <path
        d={shapePath}
        fill="currentColor"
        stroke="currentColor"
        mask={`url(#${maskId})`}
        className="transition-[fill-opacity,stroke-opacity] duration-200 motion-reduce:transition-none"
        style={{
          fillOpacity: isSelected ? 1 : 0,
          strokeOpacity: isSelected ? 1 : 0,
        }}
      />
      <path d={shapePath} />
      {glyphPaths.map((path) => (
        <path key={path} d={path} opacity={isSelected ? 0 : 1} />
      ))}
    </svg>
  );

  const renderFlourishMark = () => {
    if (flourish === 'check') {
      return (
        <path
          d="M5 -9.5l2.5 2.5 4.5-5"
          pathLength={1}
          strokeDasharray="1 1"
          className={FLOURISH_STROKE_CLASS_NAME}
          style={getFlourishStyle('vote-flourish-draw')}
        />
      );
    }
    if (flourish === 'arc') {
      return (
        <path
          d="M-9.53 5.5A11 11 0 0 1-3.76-10.34"
          pathLength={1}
          strokeDasharray="1 1"
          className={FLOURISH_STROKE_CLASS_NAME}
          style={getFlourishStyle('vote-flourish-sweep')}
        />
      );
    }
    if (flourish === 'ring') {
      return (
        <circle
          r={9}
          className={cn(
            FLOURISH_STROKE_CLASS_NAME,
            'origin-center transform-fill',
          )}
          style={getFlourishStyle('vote-flourish-contract')}
        />
      );
    }
    return (
      <line
        x1={-9}
        y1={11.5}
        x2={9}
        y2={11.5}
        className={cn(
          FLOURISH_STROKE_CLASS_NAME,
          'origin-center transform-fill',
        )}
        style={getFlourishStyle('vote-flourish-spread')}
      />
    );
  };

  return (
    <span aria-hidden="true" className="relative inline-flex size-4 shrink-0">
      <span
        key={`motion-${animation?.nonce ?? 0}`}
        data-vote-motion={motion ?? undefined}
        className={`inline-flex ${REDUCED_MOTION_CLASS_NAME}`}
        style={motion ? getMotionStyle(voteType, motion) : undefined}
      >
        {renderGlyph()}
      </span>
      {motion === 'select' && (
        <svg
          key={`flourish-${animation?.nonce}`}
          viewBox="-16 -16 32 32"
          fill="none"
          strokeWidth={VOTE_FLOURISH.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 overflow-visible motion-reduce:hidden"
        >
          {renderFlourishMark()}
        </svg>
      )}
    </span>
  );
};
