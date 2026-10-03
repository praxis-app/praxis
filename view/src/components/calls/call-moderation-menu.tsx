import { api } from '@/client/api-client';
import { ModerationReasonDialog } from '@/components/moderation/moderation-reason-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { handleError } from '@/lib/error.utils';
import { useRemoteParticipants } from '@livekit/components-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineCallEnd, MdPersonRemove, MdShield } from 'react-icons/md';

type PendingAction =
  | { type: 'end' }
  | { type: 'remove'; userId: string; name: string };

interface Props {
  serverId: string;
  channelId: string;
  callId: string;
}

export const CallModerationMenu = ({ serverId, channelId, callId }: Props) => {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const remoteParticipants = useRemoteParticipants();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate: moderateCall, isPending } = useMutation({
    mutationFn: ({
      action,
      reason,
    }: {
      action: PendingAction;
      reason?: string;
    }) =>
      action.type === 'end'
        ? api.endCall(serverId, channelId, callId, { reason })
        : api.removeCallParticipant(
            serverId,
            channelId,
            callId,
            action.userId,
            { reason },
          ),
    onSuccess: () => {
      setPendingAction(null);
      void queryClient.invalidateQueries({
        queryKey: ['servers', serverId, 'channels', channelId, 'feed'],
      });
    },
    onError: handleError,
  });

  const isEnding = pendingAction?.type === 'end';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={t('moderation.actions.moderateCall')}
            variant="ghost"
            size="icon"
            className="bg-secondary text-secondary-foreground/85 hover:bg-secondary/70 size-11 rounded-full"
          >
            <MdShield />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          {remoteParticipants.map((participant) => {
            const name = participant.name || participant.identity;
            return (
              <DropdownMenuItem
                key={participant.identity}
                onSelect={() =>
                  setPendingAction({
                    type: 'remove',
                    userId: participant.identity,
                    name,
                  })
                }
              >
                <MdPersonRemove />
                {t('moderation.actions.removeFromCall', { name })}
              </DropdownMenuItem>
            );
          })}
          {!!remoteParticipants.length && <DropdownMenuSeparator />}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setPendingAction({ type: 'end' })}
          >
            <MdOutlineCallEnd />
            {t('moderation.actions.endCall')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModerationReasonDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={
          isEnding
            ? t('moderation.prompts.endCall')
            : t('moderation.prompts.removeParticipant')
        }
        description={
          pendingAction?.type === 'remove'
            ? pendingAction.name
            : t('moderation.actions.endCall')
        }
        confirmLabel={
          isEnding
            ? t('moderation.actions.endCall')
            : t('moderation.actions.remove')
        }
        explanation={[
          isEnding
            ? t('moderation.explanations.endCall')
            : t('moderation.explanations.removeParticipant'),
        ]}
        isReasonOptional
        isPending={isPending}
        onConfirm={(reason) => {
          if (pendingAction) {
            moderateCall({ action: pendingAction, reason });
          }
        }}
      />
    </>
  );
};
