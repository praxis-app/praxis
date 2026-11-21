import { type VoteAnimationConfig } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { type VoteType } from '@/types/vote.types';
import {
  LuCircleMinus,
  LuOctagonX,
  LuThumbsDown,
  LuThumbsUp,
} from 'react-icons/lu';

export const VOTE_ANIMATIONS: Record<VoteType, VoteAnimationConfig> = {
  agree: {
    icon: LuThumbsUp,
    animationClassName: 'motion-safe:animate-vote-pop',
    filledOpacity: 1,
    effect: 'burst',
  },
  disagree: {
    icon: LuThumbsDown,
    animationClassName: 'motion-safe:animate-vote-nudge',
    filledOpacity: 1,
    effect: 'none',
  },
  abstain: {
    icon: LuCircleMinus,
    animationClassName: 'motion-safe:animate-vote-settle',
    filledOpacity: 0.25,
    effect: 'none',
  },
  block: {
    icon: LuOctagonX,
    selectedClassName: 'text-destructive',
    animationClassName: 'motion-safe:animate-vote-stamp',
    filledOpacity: 0.25,
    effect: 'ring',
  },
};

export const BURST_PARTICLE_ANGLE_OFFSET = 18;

export const BURST_STROKE_CLASS_NAMES = {
  agree: ['stroke-vote-agree-a', 'stroke-vote-agree-b'],
  ratify: ['stroke-vote-ratify-a', 'stroke-vote-ratify-b'],
} as const;
