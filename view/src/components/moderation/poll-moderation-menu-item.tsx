import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { type PollRes } from '@/types/poll.types';
import { useTranslation } from 'react-i18next';
import { LuEye, LuEyeOff } from 'react-icons/lu';

interface Props {
  poll: PollRes;
  onSelect: () => void;
}

export const PollModerationMenuItem = ({ poll, onSelect }: Props) => {
  const { t } = useTranslation();

  const isProposal = poll.pollType === 'proposal';

  if (!poll.hiddenAt && poll.moderationPauseExhausted) {
    return (
      <DropdownMenuItem disabled>
        {t('moderation.labels.pauseLimitReached')}
      </DropdownMenuItem>
    );
  }

  if (poll.hiddenAt) {
    return (
      <DropdownMenuItem onSelect={onSelect}>
        <LuEye />
        {t(
          isProposal
            ? 'moderation.actions.restoreProposal'
            : 'moderation.actions.restorePoll',
        )}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem variant="destructive" onSelect={onSelect}>
      <LuEyeOff />
      {t(
        isProposal
          ? 'moderation.actions.hideProposal'
          : 'moderation.actions.hidePoll',
      )}
    </DropdownMenuItem>
  );
};
