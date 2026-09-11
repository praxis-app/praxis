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
import { useServerData } from '@/hooks/use-server-data';
import { truncate } from '@/lib/text.utils';
import { type ServerRoleRes } from '@/types/role.types';
import { type UserRes } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';

interface Props {
  serverRoleId: string;
  serverRoleMember: UserRes;
}

export const ServerRoleMember = ({ serverRoleId, serverRoleMember }: Props) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { serverId } = useServerData();

  const { mutate: removeMember, isPending } = useMutation({
    async mutationFn() {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.removeServerRoleMember(
        serverId,
        serverRoleId,
        serverRoleMember.id,
      );
      setIsConfirmModalOpen(false);

      queryClient.setQueryData(
        ['servers', serverId, 'roles', serverRoleId],
        (data: { serverRole: ServerRoleRes }) => {
          const filteredMembers = data.serverRole.members.filter(
            (member) => member.id !== serverRoleMember.id,
          );
          return {
            serverRole: { ...data.serverRole, members: filteredMembers },
          };
        },
      );
      queryClient.setQueryData(
        ['servers', serverId, 'roles', serverRoleId, 'members', 'eligible'],
        (data: { users: UserRes[] }) => {
          return { users: [serverRoleMember, ...data.users] };
        },
      );

      queryClient.setQueryData<{ serverRoles: ServerRoleRes[] }>(
        ['servers', serverId, 'roles'],
        (data) => {
          if (!data) {
            return data;
          }
          return {
            serverRoles: data.serverRoles.map((role) => {
              if (role.id !== serverRoleId) {
                return role;
              }
              return {
                ...role,
                members: role.members.filter(
                  (member) => member.id !== serverRoleMember.id,
                ),
                memberCount: Math.max(0, role.memberCount - 1),
              };
            }),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const name = serverRoleMember.displayName || serverRoleMember.name;
  const truncatedName = truncate(name, 18);

  return (
    <div className="mb-4 flex items-center justify-between last:mb-0">
      <div className="flex items-center">
        <UserAvatar
          userId={serverRoleMember.id}
          name={name}
          imageId={serverRoleMember.profilePicture?.id}
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
              {t('roles.prompts.removeRoleMember')}
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
