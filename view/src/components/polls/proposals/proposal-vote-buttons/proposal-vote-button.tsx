import { type VoteAnimation } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { VoteIcon } from '@/components/polls/proposals/proposal-vote-buttons/vote-icon';
import { useVoteRipples } from '@/components/polls/proposals/proposal-vote-buttons/use-vote-ripples';
import { VoteRipple } from '@/components/polls/proposals/proposal-vote-buttons/vote-ripple';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared.utils';
import { type VoteType } from '@/types/vote.types';
import { type MouseEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  voteType: VoteType;
  isSelected: boolean;
  isDisabled: boolean;
  animation?: VoteAnimation;
  onClick: () => void;
}

export const ProposalVoteButton = ({
  voteType,
  isSelected,
  isDisabled,
  animation,
  onClick,
}: Props) => {
  const { t } = useTranslation();
  const { ripples, press, release } = useVoteRipples();

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isDisabled && event.button === 0) {
      press(event.currentTarget, event.clientX, event.clientY);
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && event.detail === 0) {
      press(event.currentTarget, undefined, undefined, false);
    }
    onClick();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        'relative isolate col-span-1 overflow-hidden motion-reduce:transition-none',
        isSelected && 'bg-primary/15!',
        isDisabled && 'hover:bg-background dark:hover:bg-input/30 opacity-50',
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
    >
      {ripples.map((ripple) => (
        <VoteRipple key={ripple.id} ripple={ripple} />
      ))}
      <VoteIcon
        voteType={voteType}
        isSelected={isSelected}
        animation={animation}
      />
      {t(`proposals.actions.${voteType}`)}
    </Button>
  );
};
