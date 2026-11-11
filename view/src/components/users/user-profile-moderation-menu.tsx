import { ModerationActionMenu } from '@/components/moderation/moderation-action-menu';
import { api } from '@/client/api-client';
import { useModerationAccess } from '@/hooks/use-moderation-access';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import {
  getAccountModerationActions,
  invalidateAccountModerationQueries,
  getMemberModerationActions,
  isMemberModerationAction,
  moderateAccount,
  moderateServerMember,
  type AccountModerationAction,
  type MemberModerationAction,
} from '@/lib/moderation.utils';
import { invalidateServerMemberQueries } from '@/lib/server-member.utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

type ProfileModerationAction = MemberModerationAction | AccountModerationAction;

interface Props {
  userId: string;
  name: string;
}

export const UserProfileModerationMenu = ({ userId, name }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { serverId } = useServerData();
  const { canManageServerMembers, canSuspendUsers, canDeleteUsers } =
    useModerationAccess();

  const { data: moderationData } = useQuery({
    queryKey: ['users', userId, 'moderation', serverId],
    queryFn: () => api.getUserModeration(userId, serverId),
    enabled:
      (!!serverId && canManageServerMembers) ||
      canSuspendUsers ||
      canDeleteUsers,
  });

  const { mutate: moderateUser, isPending } = useMutation({
    mutationFn: ({
      action,
      reason,
    }: {
      action: ProfileModerationAction;
      reason?: string;
    }) => {
      if (!isMemberModerationAction(action)) {
        return moderateAccount(userId, action, reason);
      }
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return moderateServerMember(serverId, userId, action, reason);
    },
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({
        queryKey: ['users', userId, 'moderation'],
      });
      if (isMemberModerationAction(action)) {
        if (serverId) {
          invalidateServerMemberQueries(queryClient, serverId);
        }
        return;
      }
      invalidateAccountModerationQueries(queryClient, action === 'delete');
    },
    onError: handleError,
  });

  const account = moderationData?.moderation.account;
  const server = moderationData?.moderation.server;
  const canModerateMember = !!serverId && !!server?.canBeModerated;

  const actions = [
    ...getMemberModerationActions(t, {
      canRemove: canModerateMember && !!server?.isMember,
      canBan: canModerateMember && !server?.isBanned,
    }),
    ...getAccountModerationActions(t, {
      canSuspend: !!account?.canBeModerated && canSuspendUsers,
      canDelete: !!account?.canBeModerated && canDeleteUsers,
      isLocked: !!account?.locked,
      isDeleted: !!account?.deletedAt,
    }),
  ].map((action) => ({ ...action, isMenuItemDestructive: false }));

  return (
    <ModerationActionMenu<ProfileModerationAction>
      targetName={name}
      triggerLabel={t('moderation.actions.userActions', { name })}
      actions={actions}
      isPending={isPending}
      onConfirm={(action, reason, onSuccess) =>
        moderateUser({ action, reason }, { onSuccess })
      }
    />
  );
};
