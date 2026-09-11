import { Badge } from '@/components/ui/badge';
import { getProposalRuleStatus } from '@/lib/poll.utils';
import { cn } from '@/lib/shared.utils';
import { type PollRes, type PollStage } from '@/types/poll.types';
import { useTranslation } from 'react-i18next';
import {
  LuCircleCheck,
  LuCircleX,
  LuOctagonAlert,
  LuPencil,
  LuVote,
} from 'react-icons/lu';

interface Props {
  poll: PollRes;
  sourceCallHasEnded?: boolean;
  onClick: () => void;
}

const stageStyles: Record<PollStage, string> = {
  voting: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300',
  ratified:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  revision:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  closed: 'border-muted-foreground/25 bg-muted text-muted-foreground',
};

const stageIcons: Record<PollStage, typeof LuVote> = {
  voting: LuVote,
  ratified: LuCircleCheck,
  revision: LuPencil,
  closed: LuCircleX,
};

export const ProposalStatusBadge = ({
  poll,
  sourceCallHasEnded = false,
  onClick,
}: Props) => {
  const { t } = useTranslation();

  const { stage } = poll;
  const status = getProposalRuleStatus(
    poll.votes ?? [],
    poll.config,
    poll.memberCount,
  );

  // Only the label changes: the proposal still ratifies or closes on its own
  // TODO: Revisit this along with the backend rule it mirrors. "Call ended"
  // exists only in the UI, since there is no stage for it
  const callEnded = sourceCallHasEnded && stage === 'voting';

  const limitReached =
    !callEnded &&
    stage === 'voting' &&
    (!status.disagreementsMet || !status.abstainsMet || !status.blocksMet);

  const displayStage: PollStage = callEnded ? 'closed' : stage;
  const Icon = limitReached ? LuOctagonAlert : stageIcons[displayStage];

  return (
    <Badge
      asChild
      variant="outline"
      className={cn(
        'cursor-pointer gap-1.5 transition-colors hover:brightness-95 dark:hover:brightness-110',
        limitReached
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : stageStyles[displayStage],
      )}
    >
      <button type="button" onClick={onClick}>
        <Icon aria-hidden="true" />
        {callEnded
          ? t('proposals.labels.callEnded')
          : t(`proposals.labels.${stage}`)}
        {limitReached && ` · ${t('proposals.labels.limitReached')}`}
      </button>
    </Badge>
  );
};
