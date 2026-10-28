import { api } from '@/client/api-client';
import { ModerationActionMenu } from '@/components/moderation/moderation-action-menu';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import { invalidateServerMemberQueries } from '@/lib/server-member.utils';
import { type UserRes } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdBlock, MdPersonRemove } from 'react-icons/md';

type ModerationAction = 'remove' | 'ban';

interface Props {
  serverId: string;
  member: UserRes;
  canModerate: boolean;
}

export const ManagedServerMember = ({
  serverId,
  member,
  canModerate,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: moderateMember, isPending } = useMutation({
    mutationFn: async ({
      action,
      reason,
    }: {
      action: ModerationAction;
      reason?: string;
    }) => {
      if (action === 'ban') {
        await api.banServerMember(serverId, member.id, { reason });
      } else {
        await api.removeServerMember(serverId, member.id, { reason });
      }
    },
    onSuccess: () => invalidateServerMemberQueries(queryClient, serverId),
    onError: handleError,
  });

  const name = member.displayName || member.name;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          userId={member.id}
          name={name}
          imageId={member.profilePicture?.id}
        />
        <span className="truncate">{name}</span>
      </div>

      <ModerationActionMenu<ModerationAction>
        targetName={name}
        triggerLabel={t('servers.actions.memberActions', { name })}
        isPending={isPending}
        onConfirm={(action, reason, onSuccess) =>
          moderateMember({ action, reason }, { onSuccess })
        }
        actions={
          canModerate
            ? [
                {
                  key: 'remove',
                  Icon: MdPersonRemove,
                  menuLabel: t('servers.actions.removeMember'),
                  dialogTitle: t('servers.prompts.removeMember'),
                  confirmLabel: t('actions.remove'),
                  explanation: [
                    t('servers.moderationExplanations.removeEffects'),
                    t('servers.moderationExplanations.removeRejoin'),
                  ],
                  isReasonRequired: true,
                },
                {
                  key: 'ban',
                  Icon: MdBlock,
                  menuLabel: t('servers.actions.banMember'),
                  dialogTitle: t('servers.prompts.banMember'),
                  confirmLabel: t('servers.actions.ban'),
                  explanation: [
                    t('servers.moderationExplanations.banEffects'),
                    t('servers.moderationExplanations.banRejoin'),
                  ],
                  isReasonRequired: true,
                  isMenuItemDestructive: true,
                },
              ]
            : []
        }
      />
    </div>
  );
};
