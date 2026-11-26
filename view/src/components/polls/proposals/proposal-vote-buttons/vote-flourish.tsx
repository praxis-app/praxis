import {
  REDUCED_MOTION_CLASS_NAME,
  VOTE_FLOURISH,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { type VoteFlourish as VoteFlourishKind } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { getAnimationStyle } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.utils';
import { cn } from '@/lib/shared.utils';

interface Props {
  kind: VoteFlourishKind;
}

const getFlourishStyle = (keyframes: string) =>
  getAnimationStyle(
    keyframes,
    VOTE_FLOURISH.durationMs,
    VOTE_FLOURISH.easing,
    VOTE_FLOURISH.delayMs,
  );

const STROKE_CLASS_NAME = cn('stroke-vote-accent', REDUCED_MOTION_CLASS_NAME);

const FlourishMark = ({ kind }: Props) => {
  if (kind === 'check') {
    return (
      <path
        d="M5 -9.5l2.5 2.5 4.5-5"
        pathLength={1}
        strokeDasharray="1 1"
        className={STROKE_CLASS_NAME}
        style={getFlourishStyle('vote-flourish-draw')}
      />
    );
  }
  if (kind === 'arc') {
    return (
      <path
        d="M-9.53 5.5A11 11 0 0 1-3.76-10.34"
        pathLength={1}
        strokeDasharray="1 1"
        className={STROKE_CLASS_NAME}
        style={getFlourishStyle('vote-flourish-sweep')}
      />
    );
  }
  if (kind === 'ring') {
    return (
      <circle
        r={9}
        className={cn(STROKE_CLASS_NAME, 'origin-center transform-fill')}
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
      className={cn(STROKE_CLASS_NAME, 'origin-center transform-fill')}
      style={getFlourishStyle('vote-flourish-spread')}
    />
  );
};

export const VoteFlourish = ({ kind }: Props) => (
  <svg
    aria-hidden="true"
    data-testid="vote-flourish"
    data-flourish={kind}
    viewBox="-16 -16 32 32"
    fill="none"
    strokeWidth={VOTE_FLOURISH.strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="pointer-events-none absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 overflow-visible motion-reduce:hidden"
  >
    <FlourishMark kind={kind} />
  </svg>
);
