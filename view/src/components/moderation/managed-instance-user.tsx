import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import {
  getAccountModerationActions,
  invalidateAccountModerationQueries,
  moderateAccount,
  type AccountModerationAction,
} from '@/lib/moderation.utils';
import { type InstanceUserRes } from '@/types/moderation.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ModerationActionMenu } from './moderation-action-menu';

interface Props {
  user: InstanceUserRes;
  canSuspend: boolean;
  canDelete: boolean;
}

export const ManagedInstanceUser = ({ user, canSuspend, canDelete }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: moderateUser, isPending } = useMutation({
    mutationFn: ({
      action,
      reason,
    }: {
      action: AccountModerationAction;
      reason?: string;
    }) => moderateAccount(user.id, action, reason),
    onSuccess: (_data, { action }) =>
      invalidateAccountModerationQueries(queryClient, action === 'delete'),
    onError: handleError,
  });

  const name = user.displayName || user.name;
  const isDeleted = !!user.deletedAt;

  const actions = getAccountModerationActions(t, {
    canSuspend,
    canDelete,
    isLocked: user.locked,
    isDeleted,
  });

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          userId={user.id}
          name={name}
          imageId={user.profilePicture?.id}
        />
        <span className="truncate">{name}</span>
        {isDeleted && (
          <Badge variant="outline">{t('moderation.labels.deleted')}</Badge>
        )}
        {!isDeleted && user.locked && (
          <Badge variant="destructive">
            {t('moderation.labels.suspended')}
          </Badge>
        )}
        {user.anonymous && (
          <Badge variant="secondary">{t('moderation.labels.anonymous')}</Badge>
        )}
      </div>

      <ModerationActionMenu<AccountModerationAction>
        targetName={name}
        triggerLabel={t('moderation.actions.userActions', { name })}
        actions={actions}
        isPending={isPending}
        onConfirm={(action, reason, onSuccess) =>
          moderateUser({ action, reason }, { onSuccess })
        }
      />
    </div>
  );
};
