import { type VoteType } from '@/types/vote.types';

export type VoteMotion = 'select' | 'retract' | 'rollback';

export type VoteEasing = 'spring' | 'firm';

export type VoteFlourish = 'check' | 'arc' | 'ring' | 'line';

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
  flourish: VoteFlourish;
}
