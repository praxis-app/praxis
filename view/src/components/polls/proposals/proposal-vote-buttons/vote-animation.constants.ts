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
    accentClassName: 'text-positive',
    animationClassName: 'motion-safe:animate-vote-pop',
    filledOpacity: 1,
    effect: 'burst',
  },
  disagree: {
    icon: LuThumbsDown,
    accentClassName: 'text-praxis-coral',
    animationClassName: 'motion-safe:animate-vote-nudge',
    filledOpacity: 1,
    effect: 'none',
  },
  abstain: {
    icon: LuCircleMinus,
    accentClassName: 'text-praxis-blue-gray',
    animationClassName: 'motion-safe:animate-vote-settle',
    filledOpacity: 0.25,
    effect: 'none',
  },
  block: {
    icon: LuOctagonX,
    accentClassName: 'text-destructive',
    animationClassName: 'motion-safe:animate-vote-stamp',
    filledOpacity: 0.25,
    effect: 'ring',
  },
};

export const BURST_PARTICLE_ANGLE_OFFSET = 18;

export const BURST_SECONDARY_COLOR = 'var(--color-praxis-gold)';
