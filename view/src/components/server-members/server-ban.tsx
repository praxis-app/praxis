import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import { invalidateServerMemberQueries } from '@/lib/server-member.utils';
import { formatDate } from '@/lib/time.utils';
import { type ServerBanRes } from '@/types/server.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModerationReasonDialog } from '@/components/moderation/moderation-reason-dialog';

interface Props {
  serverId: string;
  ban: ServerBanRes;
}

export const ServerBan = ({ serverId, ban: { user, createdAt } }: Props) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: unbanMember, isPending } = useMutation({
    mutationFn: (reason?: string) =>
      api.unbanServerMember(serverId, user.id, { reason }),
    onSuccess: () => {
      setIsConfirmOpen(false);
      invalidateServerMemberQueries(queryClient, serverId);
    },
    onError: handleError,
  });

  const name = user.displayName || user.name;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          userId={user.id}
          name={name}
          imageId={user.profilePicture?.id}
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate">{name}</span>
          <span className="text-muted-foreground text-xs">
            {t('servers.labels.bannedOn', { date: formatDate(createdAt) })}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isPending}
      >
        {t('servers.actions.unban')}
      </Button>

      <ModerationReasonDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={t('servers.prompts.unbanMember')}
        description={name}
        confirmLabel={t('servers.actions.unban')}
        explanation={[t('servers.moderationExplanations.unban')]}
        isReasonOptional
        isDestructive={false}
        isPending={isPending}
        onConfirm={(reason) => unbanMember(reason)}
      />
    </div>
  );
};
