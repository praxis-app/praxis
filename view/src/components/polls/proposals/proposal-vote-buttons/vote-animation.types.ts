import { type VoteType } from '@/types/vote.types';

export type VoteMotion = 'select' | 'retract' | 'rollback';

export type VoteEasing = 'spring' | 'firm';

export interface VoteAnimation {
  nonce: number;
  motion: VoteMotion | null;
}

export type VoteAnimations = Partial<Record<VoteType, VoteAnimation>>;

export interface VoteGlyphConfig {
  shapePath: string;
  glyphPaths: string[];
  selectKeyframes: string;
  selectEasing: VoteEasing;
  flourishPeak: string;
  flourishTravel: string;
}

export interface VoteRipple {
  id: number;
  x: number;
  y: number;
  size: number;
  isReleased: boolean;
}
