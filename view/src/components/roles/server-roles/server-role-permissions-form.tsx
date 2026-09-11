import { api } from '@/client/api-client';
import { SERVER_PERMISSION_KEYS } from '@/constants/role.constants';
import { useServerData } from '@/hooks/use-server-data';
import { getServerPermissionValues } from '@/lib/role.utils';
import {
  type ServerPermission,
  type ServerPermissionKeys,
  type ServerRoleRes,
} from '@/types/role.types';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RolePermissionToggle } from '../role-permission-toggle';

// TODO: Add form schema with zod

// TODO: Convert `permissions` to hash map type
interface FormValues {
  permissions: {
    name: ServerPermissionKeys;
    value: boolean;
  }[];
}

interface Props {
  serverRole: ServerRoleRes;
}

export const ServerRolePermissionsForm = ({ serverRole }: Props) => {
  const { serverId } = useServerData();

  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      permissions: getServerPermissionValues(serverRole.permissions),
    },
  });

  const queryClient = useQueryClient();

  const { mutate: updatePermissions, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const permissions = values.permissions.reduce<ServerPermission[]>(
        (result, permission) => {
          if (!permission.value) {
            return result;
          }
          if (permission.name === 'manageChannels') {
            result.push({ subject: 'Channel', action: ['manage'] });
          }
          if (permission.name === 'manageServerSettings') {
            result.push({ subject: 'ServerConfig', action: ['manage'] });
          }
          if (permission.name === 'createInvites') {
            result.push({ subject: 'Invite', action: ['read', 'create'] });
          }
          if (permission.name === 'manageInvites') {
            result.push({ subject: 'Invite', action: ['manage'] });
          }
          if (permission.name === 'manageServerRoles') {
            result.push({ subject: 'ServerRole', action: ['manage'] });
          }
          if (permission.name === 'blockProposals') {
            result.push({ subject: 'ProposalBlock', action: ['create'] });
          }
          return result;
        },
        [],
      );
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.updateServerRolePermissions(serverId, serverRole.id, {
        permissions,
      });

      queryClient.setQueryData<{ serverRole: ServerRoleRes }>(
        ['servers', serverId, 'roles', serverRole.id],
        (oldData) => {
          if (!oldData) {
            return { serverRole };
          }
          return { serverRole: { ...oldData.serverRole, permissions } };
        },
      );
      queryClient.setQueryData<{ serverRoles: ServerRoleRes[] }>(
        ['servers', serverId, 'roles'],
        (data) => {
          if (!data) {
            return data;
          }
          return {
            serverRoles: data.serverRoles.map((role) =>
              role.id === serverRole.id ? { ...role, permissions } : role,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
      reset({
        permissions: getServerPermissionValues(permissions),
      });
    },
  });

  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit((fv) => updatePermissions(fv))}>
      <Controller
        name="permissions"
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            {SERVER_PERMISSION_KEYS.map((permissionName, index) => (
              <RolePermissionToggle
                key={permissionName}
                permissionName={permissionName}
                checked={value[index].value}
                onChange={(checked) => {
                  const newPermissions = [...value];
                  newPermissions[index].value = checked;
                  onChange(newPermissions);
                }}
              />
            ))}
          </>
        )}
      />

      <div className="mt-6 flex justify-end">
        <Button disabled={isPending || !formState.isDirty} type="submit">
          {isPending ? t('states.saving') : t('actions.save')}
        </Button>
      </div>
    </form>
  );
};
