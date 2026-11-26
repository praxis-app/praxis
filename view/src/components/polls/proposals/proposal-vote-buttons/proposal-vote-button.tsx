import { type VoteAnimation } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { VoteIcon } from '@/components/polls/proposals/proposal-vote-buttons/vote-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared.utils';
import { type VoteType } from '@/types/vote.types';
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

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        'col-span-1',
        isSelected && 'bg-primary/15!',
        isDisabled
          ? 'hover:bg-background dark:hover:bg-input/30 opacity-50'
          : 'motion-safe:active:scale-95',
      )}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
    >
      <VoteIcon
        voteType={voteType}
        isSelected={isSelected}
        animation={animation}
      />
      {t(`proposals.actions.${voteType}`)}
    </Button>
  );
};
