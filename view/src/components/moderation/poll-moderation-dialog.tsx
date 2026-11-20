import { api } from '@/client/api-client';
import { getActiveDecisionsQueryKey } from '@/components/decisions/decisions-panel.utils';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { type PollRes } from '@/types/poll.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ModerationReasonDialog } from './moderation-reason-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: PollRes;
  channelId: string;
}

export const PollModerationDialog = ({
  open,
  onOpenChange,
  poll,
  channelId,
}: Props) => {
  const { serverId } = useServerData();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const isHidden = !!poll.hiddenAt;
  const isProposal = poll.pollType === 'proposal';

  const { mutate: moderatePoll, isPending } = useMutation({
    mutationFn: (reason?: string) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const moderate = isHidden ? api.restorePoll : api.hidePoll;
      return moderate(serverId, channelId, poll.id, { reason });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['servers', serverId, 'channels', channelId],
        }),
        queryClient.invalidateQueries({
          queryKey: getActiveDecisionsQueryKey(serverId),
        }),
      ]);
      onOpenChange(false);
    },
    onError: handleError,
  });

  const title = isHidden
    ? t(
        isProposal
          ? 'moderation.prompts.restoreProposal'
          : 'moderation.prompts.restorePoll',
      )
    : t(
        isProposal
          ? 'moderation.prompts.hideProposal'
          : 'moderation.prompts.hidePoll',
      );

  const isVoting = poll.stage === 'voting';
  const hideExplanation = isVoting
    ? isProposal
      ? 'moderation.explanations.hideProposal'
      : 'moderation.explanations.hidePoll'
    : 'moderation.explanations.hideCompletedPoll';
  const restoreExplanation = isVoting
    ? isProposal
      ? 'moderation.explanations.restoreProposal'
      : 'moderation.explanations.restorePoll'
    : 'moderation.explanations.restoreCompletedPoll';

  return (
    <ModerationReasonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={t(isHidden ? restoreExplanation : hideExplanation)}
      confirmLabel={t(
        isHidden ? 'moderation.actions.restore' : 'moderation.actions.hide',
      )}
      isReasonRequired={!isHidden}
      isDestructive={!isHidden}
      isPending={isPending}
      onConfirm={(reason) => moderatePoll(reason)}
    />
  );
};
