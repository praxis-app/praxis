import { VOTE_GLYPHS } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { type VoteType } from '@/types/vote.types';
import { useId } from 'react';

interface Props {
  voteType: VoteType;
  isSelected: boolean;
}

export const VoteGlyph = ({ voteType, isSelected }: Props) => {
  const maskId = `vote-glyph-${useId().replace(/[^\w-]/g, '')}`;

  const { shapePath, glyphPaths } = VOTE_GLYPHS[voteType];
  return (
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
};
