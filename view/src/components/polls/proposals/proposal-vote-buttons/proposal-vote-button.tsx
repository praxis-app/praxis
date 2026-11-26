import { type VoteAnimation } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { VoteIcon } from '@/components/polls/proposals/proposal-vote-buttons/vote-icon';
import { VOTE_RIPPLE } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { useVoteRipples } from '@/components/polls/proposals/proposal-vote-buttons/use-vote-ripples';
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
        'relative isolate col-span-1 overflow-hidden',
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
        <span
          key={ripple.id}
          className={cn(
            'pointer-events-none absolute -z-10 transition-opacity ease-out motion-reduce:hidden',
            ripple.isReleased && 'opacity-0',
          )}
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            transitionDuration: `${VOTE_RIPPLE.fadeMs}ms`,
          }}
        >
          <span
            className="animate-vote-ripple block size-full rounded-full bg-[radial-gradient(circle_closest-side,var(--vote-ripple-center),var(--vote-ripple-edge)_var(--vote-ripple-edge-stop),transparent)]"
            style={{ animationDuration: `${VOTE_RIPPLE.rampMs}ms` }}
          />
        </span>
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
