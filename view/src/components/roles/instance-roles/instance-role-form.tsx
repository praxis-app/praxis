import { api } from '@/client/api-client';
import { RoleForm } from '../role-form';
import { type CreateRoleReq, type InstanceRoleRes } from '@/types/role.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
  editRole?: InstanceRoleRes;
}

export const InstanceRoleForm = ({ editRole }: Props) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createInstanceRole, isPending: isCreatePending } =
    useMutation({
      mutationFn: async (data: CreateRoleReq) => {
        const { instanceRole } = await api.createInstanceRole(data);

        queryClient.setQueryData<{ instanceRoles: InstanceRoleRes[] }>(
          ['instance-roles'],
          (oldData) => {
            if (!oldData) {
              return { instanceRoles: [] };
            }
            return { instanceRoles: [instanceRole, ...oldData.instanceRoles] };
          },
        );
        return instanceRole;
      },
    });

  const { mutateAsync: updateInstanceRole, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async (data: CreateRoleReq) => {
        if (!editRole) {
          return;
        }
        await api.updateInstanceRole(editRole.id, data);

        const instanceRole = { ...editRole, ...data };
        queryClient.setQueryData<{ instanceRole: InstanceRoleRes }>(
          ['instance-roles', editRole.id],
          { instanceRole },
        );
        queryClient.setQueryData<{ instanceRoles: InstanceRoleRes[] }>(
          ['instance-roles'],
          (oldData) => {
            if (!oldData) {
              return { instanceRoles: [] };
            }
            return {
              instanceRoles: oldData.instanceRoles.map((r) =>
                r.id === instanceRole.id ? instanceRole : r,
              ),
            };
          },
        );

        return instanceRole;
      },
    });

  const handleSubmitForm = (data: CreateRoleReq) => {
    if (editRole) {
      return updateInstanceRole(data);
    }
    return createInstanceRole(data);
  };

  return (
    <RoleForm
      editRole={editRole}
      isSubmitting={isCreatePending || isUpdatePending}
      onSubmit={handleSubmitForm}
    />
  );
};
