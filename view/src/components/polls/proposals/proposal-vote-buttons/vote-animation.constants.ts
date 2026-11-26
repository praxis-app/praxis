import {
  type VoteEasing,
  type VoteGlyphConfig,
  type VoteMotion,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { type VoteType } from '@/types/vote.types';

export const VOTE_EASINGS: Record<VoteEasing, string> = {
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  firm: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

export const VOTE_MOTION_DURATIONS_MS: Record<VoteMotion, number> = {
  select: 480,
  retract: 240,
  rollback: 420,
};

export const VOTE_FLOURISH = {
  durationMs: 420,
  delayMs: 60,
  easing: 'ease-out',
  strokeWidth: 1.5,
} as const;

export const VOTE_GLYPHS: Record<VoteType, VoteGlyphConfig> = {
  agree: {
    shapePath:
      'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z',
    glyphPaths: ['M7 10v12'],
    selectKeyframes: 'vote-agree-settle',
    selectEasing: 'spring',
    flourish: 'check',
  },
  disagree: {
    shapePath:
      'M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z',
    glyphPaths: ['M17 14V2'],
    selectKeyframes: 'vote-disagree-turn',
    selectEasing: 'spring',
    flourish: 'arc',
  },
  abstain: {
    shapePath: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    glyphPaths: ['M8 12h8'],
    selectKeyframes: 'vote-abstain-recede',
    selectEasing: 'firm',
    flourish: 'ring',
  },
  // TODO: Test the block motion in the app. It's only been checked with mocked votes
  block: {
    shapePath:
      'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
    glyphPaths: ['m15 9-6 6', 'm9 9 6 6'],
    selectKeyframes: 'vote-block-press',
    selectEasing: 'firm',
    flourish: 'line',
  },
};

export const REDUCED_MOTION_CLASS_NAME = 'motion-reduce:animate-none!';
