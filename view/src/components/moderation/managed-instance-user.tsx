import { api } from '@/client/api-client';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import { invalidateAccountModerationQueries } from '@/lib/moderation.utils';
import { type InstanceUserRes } from '@/types/moderation.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdBlock, MdDeleteForever, MdRestore } from 'react-icons/md';
import {
  ModerationActionMenu,
  type ModerationMenuAction,
} from './moderation-action-menu';

type AccountAction = 'suspend' | 'restore' | 'delete';

interface Props {
  user: InstanceUserRes;
  canSuspend: boolean;
  canDelete: boolean;
}

export const ManagedInstanceUser = ({ user, canSuspend, canDelete }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: moderateAccount, isPending } = useMutation({
    mutationFn: ({
      action,
      reason,
    }: {
      action: AccountAction;
      reason?: string;
    }) => {
      if (action === 'suspend') {
        return api.suspendUser(user.id, { reason });
      }
      if (action === 'restore') {
        return api.restoreUser(user.id, { reason });
      }
      return api.deleteUser(user.id, { reason });
    },
    onSuccess: (_data, { action }) =>
      invalidateAccountModerationQueries(queryClient, action === 'delete'),
    onError: handleError,
  });

  const name = user.displayName || user.name;
  const isDeleted = !!user.deletedAt;

  const actions: ModerationMenuAction<AccountAction>[] = [];
  if (!isDeleted && canSuspend && !user.locked) {
    actions.push({
      key: 'suspend',
      Icon: MdBlock,
      menuLabel: t('moderation.actions.suspendUser'),
      dialogTitle: t('moderation.prompts.suspendUser'),
      confirmLabel: t('moderation.actions.suspend'),
      explanation: [t('moderation.explanations.suspendUser')],
      isReasonRequired: true,
    });
  }
  if (!isDeleted && canSuspend && user.locked) {
    actions.push({
      key: 'restore',
      Icon: MdRestore,
      menuLabel: t('moderation.actions.restoreUser'),
      dialogTitle: t('moderation.prompts.restoreUser'),
      confirmLabel: t('moderation.actions.restore'),
      explanation: [t('moderation.explanations.restoreUser')],
      isReasonRequired: false,
      isDialogDestructive: false,
    });
  }
  if (!isDeleted && canDelete) {
    actions.push({
      key: 'delete',
      Icon: MdDeleteForever,
      menuLabel: t('moderation.actions.deleteUser'),
      dialogTitle: t('moderation.prompts.deleteUser'),
      confirmLabel: t('moderation.actions.delete'),
      explanation: [t('moderation.explanations.deleteUser')],
      isReasonRequired: true,
      isMenuItemDestructive: true,
    });
  }

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

      <ModerationActionMenu<AccountAction>
        targetName={name}
        triggerLabel={t('moderation.actions.userActions', { name })}
        actions={actions}
        isPending={isPending}
        onConfirm={(action, reason, onSuccess) =>
          moderateAccount({ action, reason }, { onSuccess })
        }
      />
    </div>
  );
};
