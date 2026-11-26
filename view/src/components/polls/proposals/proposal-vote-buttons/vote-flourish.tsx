import { VOTE_GLYPHS } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { type VoteType } from '@/types/vote.types';
import { type CSSProperties } from 'react';

interface Props {
  voteType: VoteType;
}

export const VoteFlourish = ({ voteType }: Props) => {
  const { shapePath, flourishPeak, flourishTravel } = VOTE_GLYPHS[voteType];

  return (
    <svg
      aria-hidden="true"
      data-testid="vote-flourish"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-vote-flourish stroke-vote-accent pointer-events-none absolute inset-0 size-4 overflow-visible motion-reduce:hidden"
      style={
        {
          '--vote-flourish-peak': flourishPeak,
          '--vote-flourish-travel': flourishTravel,
        } as CSSProperties
      }
    >
      <path d={shapePath} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};
