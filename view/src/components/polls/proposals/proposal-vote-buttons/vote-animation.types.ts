import { type VoteType } from '@/types/vote.types';
import { type IconType } from 'react-icons';

export type VoteEffect = 'burst' | 'ring' | 'none';

export interface VoteAnimation {
  nonce: number;
  isPlaying: boolean;
  isRatifying: boolean;
}

export type VoteAnimations = Partial<Record<VoteType, VoteAnimation>>;

export interface VoteAnimationConfig {
  icon: IconType;
  accentClassName: string;
  animationClassName: string;
  filledOpacity: number;
  effect: VoteEffect;
}
