import { api } from '@/client/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import { invalidateAccountModerationQueries } from '@/lib/moderation.utils';
import { type InstanceUserRes } from '@/types/moderation.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdBlock,
  MdDeleteForever,
  MdMoreHoriz,
  MdRestore,
} from 'react-icons/md';
import { ModerationReasonDialog } from './moderation-reason-dialog';

type AccountAction = 'suspend' | 'restore' | 'delete';

interface Props {
  user: InstanceUserRes;
  canSuspend: boolean;
  canDelete: boolean;
}

export const ManagedInstanceUser = ({ user, canSuspend, canDelete }: Props) => {
  const [pendingAction, setPendingAction] = useState<AccountAction | null>(
    null,
  );

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
    onSuccess: (_data, { action }) => {
      setPendingAction(null);
      invalidateAccountModerationQueries(queryClient, action === 'delete');
    },
    onError: handleError,
  });

  const name = user.displayName || user.name;
  const isDeleted = !!user.deletedAt;
  const canShowSuspend = canSuspend && !user.locked;
  const canShowRestore = canSuspend && user.locked;
  const hasActions = !isDeleted && (canSuspend || canDelete);

  const dialogCopy = {
    suspend: {
      title: t('moderation.prompts.suspendUser'),
      confirmLabel: t('moderation.actions.suspend'),
      explanation: t('moderation.explanations.suspendUser'),
    },
    restore: {
      title: t('moderation.prompts.restoreUser'),
      confirmLabel: t('moderation.actions.restore'),
      explanation: t('moderation.explanations.restoreUser'),
    },
    delete: {
      title: t('moderation.prompts.deleteUser'),
      confirmLabel: t('moderation.actions.delete'),
      explanation: t('moderation.explanations.deleteUser'),
    },
  };
  const copy = pendingAction ? dialogCopy[pendingAction] : undefined;

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

      {hasActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t('moderation.actions.userActions', { name })}
              className="size-9 p-0"
              variant="ghost"
              size="icon"
              disabled={isPending}
            >
              <MdMoreHoriz className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canShowSuspend && (
              <DropdownMenuItem onSelect={() => setPendingAction('suspend')}>
                <MdBlock className="size-4" />
                {t('moderation.actions.suspendUser')}
              </DropdownMenuItem>
            )}
            {canShowRestore && (
              <DropdownMenuItem onSelect={() => setPendingAction('restore')}>
                <MdRestore className="size-4" />
                {t('moderation.actions.restoreUser')}
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setPendingAction('delete')}
              >
                <MdDeleteForever className="size-4" />
                {t('moderation.actions.deleteUser')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ModerationReasonDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={copy?.title ?? ''}
        description={name}
        confirmLabel={copy?.confirmLabel ?? ''}
        explanation={copy ? [copy.explanation] : []}
        isReasonOptional={pendingAction === 'restore'}
        isReasonRequired={pendingAction !== 'restore'}
        isDestructive={pendingAction !== 'restore'}
        isPending={isPending}
        onConfirm={(reason) => {
          if (pendingAction) {
            moderateAccount({ action: pendingAction, reason });
          }
        }}
      />
    </div>
  );
};
