import {
  REDUCED_MOTION_CLASS_NAME,
  VOTE_EASINGS,
  VOTE_GLYPHS,
  VOTE_MOTION_DURATIONS_MS,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import {
  type VoteAnimation,
  type VoteMotion,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { getAnimationStyle } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.utils';
import { VoteFlourish } from '@/components/polls/proposals/proposal-vote-buttons/vote-flourish';
import { VoteGlyph } from '@/components/polls/proposals/proposal-vote-buttons/vote-glyph';
import { type VoteType } from '@/types/vote.types';

interface Props {
  voteType: VoteType;
  isSelected: boolean;
  animation?: VoteAnimation;
}

const getMotionStyle = (voteType: VoteType, motion: VoteMotion) => {
  const durationMs = VOTE_MOTION_DURATIONS_MS[motion];
  if (motion === 'select') {
    const { selectKeyframes, selectEasing } = VOTE_GLYPHS[voteType];
    return getAnimationStyle(
      selectKeyframes,
      durationMs,
      VOTE_EASINGS[selectEasing],
    );
  }
  return getAnimationStyle(`vote-${motion}`, durationMs, VOTE_EASINGS.firm);
};

export const VoteIcon = ({ voteType, isSelected, animation }: Props) => {
  const motion = animation?.motion ?? null;

  return (
    <span aria-hidden="true" className="relative inline-flex size-4 shrink-0">
      <span
        key={`motion-${animation?.nonce ?? 0}`}
        data-vote-motion={motion ?? undefined}
        className={`inline-flex ${REDUCED_MOTION_CLASS_NAME}`}
        style={motion ? getMotionStyle(voteType, motion) : undefined}
      >
        <VoteGlyph voteType={voteType} isSelected={isSelected} />
      </span>
      {motion === 'select' && (
        <VoteFlourish
          key={`flourish-${animation?.nonce}`}
          kind={VOTE_GLYPHS[voteType].flourish}
        />
      )}
    </span>
  );
};
