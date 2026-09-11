import { api } from '@/client/api-client';
import { RoleForm } from '../role-form';
import { useServerData } from '@/hooks/use-server-data';
import { type CreateRoleReq, type ServerRoleRes } from '@/types/role.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
  editRole?: ServerRoleRes;
}

export const ServerRoleForm = ({ editRole }: Props) => {
  const queryClient = useQueryClient();
  const { serverId } = useServerData();

  const { mutateAsync: createServerRole, isPending: isCreatePending } =
    useMutation({
      mutationFn: async (data: CreateRoleReq) => {
        if (!serverId) {
          throw new Error('Server ID is required');
        }
        const { serverRole } = await api.createServerRole(serverId, data);

        queryClient.setQueryData<{ serverRoles: ServerRoleRes[] }>(
          ['servers', serverId, 'roles'],
          (oldData) => {
            if (!oldData) {
              return { serverRoles: [] };
            }
            return { serverRoles: [serverRole, ...oldData.serverRoles] };
          },
        );

        return serverRole;
      },
    });

  const { mutateAsync: updateServerRole, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async (data: CreateRoleReq) => {
        if (!editRole || !serverId) {
          return;
        }
        await api.updateServerRole(serverId, editRole.id, data);

        const serverRole = { ...editRole, ...data };
        queryClient.setQueryData<{ serverRole: ServerRoleRes }>(
          ['servers', serverId, 'roles', editRole.id],
          {
            serverRole,
          },
        );
        queryClient.setQueryData<{ serverRoles: ServerRoleRes[] }>(
          ['servers', serverId, 'roles'],
          (oldData) => {
            if (!oldData) {
              return { serverRoles: [] };
            }
            return {
              serverRoles: oldData.serverRoles.map((r) =>
                r.id === serverRole.id ? serverRole : r,
              ),
            };
          },
        );

        return serverRole;
      },
    });

  const handleSubmitForm = (data: CreateRoleReq) => {
    if (editRole) {
      return updateServerRole(data);
    }
    return createServerRole(data);
  };

  return (
    <RoleForm
      editRole={editRole}
      isSubmitting={isCreatePending || isUpdatePending}
      onSubmit={handleSubmitForm}
    />
  );
};
