import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import { invalidateServerMemberQueries } from '@/lib/server-member.utils';
import { type UserRes } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdBlock, MdMoreHoriz, MdPersonRemove } from 'react-icons/md';
import { MemberModerationDialog } from './member-moderation-dialog';

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
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(
    null,
  );

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
    onSuccess: () => {
      setPendingAction(null);
      invalidateServerMemberQueries(queryClient, serverId);
    },
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

      {canModerate && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t('servers.actions.memberActions', { name })}
              className="size-9 p-0"
              variant="ghost"
              size="icon"
              disabled={isPending}
            >
              <MdMoreHoriz className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setPendingAction('remove')}>
              <MdPersonRemove className="size-4" />
              {t('servers.actions.removeMember')}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setPendingAction('ban')}
            >
              <MdBlock className="size-4" />
              {t('servers.actions.banMember')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <MemberModerationDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={
          pendingAction === 'ban'
            ? t('servers.prompts.banMember')
            : t('servers.prompts.removeMember')
        }
        memberName={name}
        confirmLabel={
          pendingAction === 'ban'
            ? t('servers.actions.ban')
            : t('actions.remove')
        }
        explanation={
          pendingAction === 'ban'
            ? [
                t('servers.moderationExplanations.banEffects'),
                t('servers.moderationExplanations.banRejoin'),
              ]
            : [
                t('servers.moderationExplanations.removeEffects'),
                t('servers.moderationExplanations.removeRejoin'),
              ]
        }
        isPending={isPending}
        onConfirm={(reason) => {
          if (pendingAction) {
            moderateMember({ action: pendingAction, reason });
          }
        }}
      />
    </div>
  );
};
