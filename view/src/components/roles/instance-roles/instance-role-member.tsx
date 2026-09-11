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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';
import { truncate } from '@/lib/text.utils';
import { type InstanceRoleRes } from '@/types/role.types';
import { type UserRes } from '@/types/user.types';

interface Props {
  instanceRoleId: string;
  instanceRoleMember: UserRes;
}

export const InstanceRoleMember = ({
  instanceRoleId,
  instanceRoleMember,
}: Props) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: removeMember, isPending } = useMutation({
    async mutationFn() {
      await api.removeInstanceRoleMember(instanceRoleId, instanceRoleMember.id);
      setIsConfirmModalOpen(false);

      queryClient.setQueryData(
        ['instance-roles', instanceRoleId],
        (data: { instanceRole: InstanceRoleRes }) => {
          const filteredMembers = data.instanceRole.members.filter(
            (member) => member.id !== instanceRoleMember.id,
          );
          return {
            instanceRole: {
              ...data.instanceRole,
              members: filteredMembers,
              memberCount: Math.max(0, data.instanceRole.memberCount - 1),
            },
          };
        },
      );
      queryClient.setQueryData(
        ['instance-roles', instanceRoleId, 'members', 'eligible'],
        (data: { users: UserRes[] }) => {
          return { users: [instanceRoleMember, ...data.users] };
        },
      );

      queryClient.setQueryData<{ instanceRoles: InstanceRoleRes[] }>(
        ['instance-roles'],
        (data) => {
          if (!data) {
            return data;
          }
          return {
            instanceRoles: data.instanceRoles.map((role) => {
              if (role.id !== instanceRoleId) {
                return role;
              }
              return {
                ...role,
                members: role.members.filter(
                  (member) => member.id !== instanceRoleMember.id,
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

  const name = instanceRoleMember.displayName || instanceRoleMember.name;
  const truncatedName = truncate(name, 18);

  return (
    <div className="mb-4 flex items-center justify-between last:mb-0">
      <div className="flex items-center">
        <UserAvatar
          userId={instanceRoleMember.id}
          name={name}
          imageId={instanceRoleMember.profilePicture?.id}
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
