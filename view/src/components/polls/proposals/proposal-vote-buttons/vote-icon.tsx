import { type VoteMotion } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { cn } from '@/lib/shared.utils';
import { type VoteType } from '@/types/vote.types';
import { type ReactNode, useId } from 'react';

interface Props {
  voteType: VoteType;
  isSelected: boolean;
  motion: VoteMotion | null;
}

interface VoteGlyph {
  shapePath: string;
  glyphPaths: string[];
  selectClassName: string;
  flourish: ReactNode;
}

const FLOURISH_CLASS_NAME = 'stroke-vote-accent';

const VOTE_GLYPHS: Record<VoteType, VoteGlyph> = {
  agree: {
    shapePath:
      'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z',
    glyphPaths: ['M7 10v12'],
    selectClassName: 'motion-safe:animate-vote-agree',
    flourish: (
      <path
        d="M5 -9.5l2.5 2.5 4.5-5"
        pathLength={1}
        strokeDasharray="1 1"
        className={cn(FLOURISH_CLASS_NAME, 'animate-vote-flourish-draw')}
      />
    ),
  },
  disagree: {
    shapePath:
      'M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z',
    glyphPaths: ['M17 14V2'],
    selectClassName: 'motion-safe:animate-vote-disagree',
    flourish: (
      <path
        d="M-9.53 5.5A11 11 0 0 1-3.76-10.34"
        pathLength={1}
        strokeDasharray="1 1"
        className={cn(FLOURISH_CLASS_NAME, 'animate-vote-flourish-sweep')}
      />
    ),
  },
  abstain: {
    shapePath: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    glyphPaths: ['M8 12h8'],
    selectClassName: 'motion-safe:animate-vote-abstain',
    flourish: (
      <circle
        r={9}
        className={cn(
          FLOURISH_CLASS_NAME,
          'animate-vote-flourish-contract origin-center transform-fill',
        )}
      />
    ),
  },
  // TODO: Test the block motion in the app. It's only been checked with mocked votes
  block: {
    shapePath:
      'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
    glyphPaths: ['m15 9-6 6', 'm9 9 6 6'],
    selectClassName: 'motion-safe:animate-vote-block',
    flourish: (
      <line
        x1={-9}
        y1={11.5}
        x2={9}
        y2={11.5}
        className={cn(
          FLOURISH_CLASS_NAME,
          'animate-vote-flourish-spread origin-center transform-fill',
        )}
      />
    ),
  },
};

const MOTION_CLASS_NAMES: Record<Exclude<VoteMotion, 'select'>, string> = {
  retract: 'motion-safe:animate-vote-retract',
  rollback: 'motion-safe:animate-vote-rollback',
};

export const VoteIcon = ({ voteType, isSelected, motion }: Props) => {
  const maskId = `vote-glyph-${useId().replace(/[^\w-]/g, '')}`;

  const { shapePath, glyphPaths, selectClassName, flourish } =
    VOTE_GLYPHS[voteType];
  const motionClassName =
    motion === 'select'
      ? selectClassName
      : motion && MOTION_CLASS_NAMES[motion];

  return (
    <span aria-hidden="true" className="relative inline-flex size-4 shrink-0">
      <span className={cn('inline-flex', motionClassName)}>
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
      </span>
      {motion === 'select' && (
        <svg
          viewBox="-16 -16 32 32"
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 overflow-visible motion-reduce:hidden"
        >
          {flourish}
        </svg>
      )}
    </span>
  );
};
