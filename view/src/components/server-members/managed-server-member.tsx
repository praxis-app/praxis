import { ModerationActionMenu } from '@/components/moderation/moderation-action-menu';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import {
  getMemberModerationActions,
  moderateServerMember,
  type MemberModerationAction,
} from '@/lib/moderation.utils';
import { invalidateServerMemberQueries } from '@/lib/server-member.utils';
import { type UserRes } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
    mutationFn: ({
      action,
      reason,
    }: {
      action: MemberModerationAction;
      reason?: string;
    }) => moderateServerMember(serverId, member.id, action, reason),
    onSuccess: () => invalidateServerMemberQueries(queryClient, serverId),
    onError: handleError,
  });

  const name = member.displayName || member.name;
  const actions = getMemberModerationActions(t, {
    canRemove: canModerate,
    canBan: canModerate,
  });

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

      <ModerationActionMenu<MemberModerationAction>
        targetName={name}
        triggerLabel={t('servers.actions.memberActions', { name })}
        isPending={isPending}
        onConfirm={(action, reason, onSuccess) =>
          moderateMember({ action, reason }, { onSuccess })
        }
        actions={actions}
      />
    </div>
  );
};
