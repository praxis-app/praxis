import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserAvatar } from '@/components/users/user-avatar';
import { handleError } from '@/lib/error.utils';
import { truncate } from '@/lib/text.utils';
import { type UserRes } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';

interface Props {
  serverId: string;
  member: UserRes;
}

export const ServerMember = ({ serverId, member }: Props) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: removeMember, isPending } = useMutation({
    async mutationFn() {
      await api.removeServerMembers(serverId, [member.id]);
      setIsConfirmModalOpen(false);

      queryClient.setQueryData(
        ['servers', serverId, 'members'],
        (data: { users: UserRes[] } | undefined) => {
          if (!data) {
            return { users: [] };
          }
          return {
            users: data.users.filter((user) => user.id !== member.id),
          };
        },
      );

      queryClient.setQueryData(
        ['servers', serverId, 'members', 'eligible'],
        (data: { users: UserRes[] } | undefined) => {
          if (!data) {
            return { users: [member] };
          }
          return { users: [member, ...data.users] };
        },
      );
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const name = member.displayName || member.name;
  const truncatedName = truncate(name, 18);

  return (
    <div className="mb-4 flex items-center justify-between last:mb-0">
      <div className="flex items-center">
        <UserAvatar
          userId={member.id}
          name={name}
          imageId={member.profilePicture?.id}
          className="mr-4"
        />
        <span className="max-w-48 truncate">{truncatedName}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsConfirmModalOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        <LuX className="h-4 w-4" />
      </Button>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="md:min-w-sm">
          <DialogHeader className="pt-3">
            <DialogTitle className="text-left">
              {t('servers.prompts.removeMember')}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="pb-3">{name}</DialogDescription>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => removeMember()}
              disabled={isPending}
            >
              {t('actions.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
