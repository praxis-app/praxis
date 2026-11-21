import { VOTE_ANIMATIONS } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { type VoteAnimation } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { VoteBurst } from '@/components/polls/proposals/proposal-vote-buttons/vote-burst';
import { VoteRing } from '@/components/polls/proposals/proposal-vote-buttons/vote-ring';
import { cn } from '@/lib/shared.utils';
import { type VoteType } from '@/types/vote.types';

interface Props {
  voteType: VoteType;
  isSelected: boolean;
  animation?: VoteAnimation;
}

export const VoteIcon = ({ voteType, isSelected, animation }: Props) => {
  const {
    icon: Icon,
    selectedClassName,
    animationClassName,
    filledOpacity,
    effect,
  } = VOTE_ANIMATIONS[voteType];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex size-4 shrink-0 transition-colors duration-200 motion-reduce:transition-none',
        isSelected && selectedClassName,
      )}
    >
      <span
        key={`icon-${animation?.nonce ?? 0}`}
        className={cn(
          'inline-flex',
          animation?.isPlaying && animationClassName,
        )}
      >
        <Icon
          fill="currentColor"
          className="size-4 transition-[fill-opacity] duration-200 motion-reduce:transition-none"
          style={{ fillOpacity: isSelected ? filledOpacity : 0 }}
        />
      </span>
      {animation?.isPlaying && effect === 'burst' && (
        <VoteBurst
          key={`burst-${animation.nonce}`}
          isLarge={animation.isRatifying}
        />
      )}
      {animation?.isPlaying && effect === 'ring' && (
        <VoteRing key={`ring-${animation.nonce}`} />
      )}
    </span>
  );
};
