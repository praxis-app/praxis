import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import { INSTANCE_PERMISSION_KEYS } from '@/constants/role.constants';
import { getInstancePermissionValues } from '@/lib/role.utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  type InstancePermission,
  type InstancePermissionKeys,
  type InstanceRoleRes,
} from '@/types/role.types';
import { RolePermissionToggle } from '../role-permission-toggle';

// TODO: Add form schema with zod

interface FormValues {
  permissions: {
    name: InstancePermissionKeys;
    value: boolean;
  }[];
}

interface Props {
  instanceRole: InstanceRoleRes;
}

export const InstanceRolePermissionsForm = ({ instanceRole }: Props) => {
  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      permissions: getInstancePermissionValues(instanceRole.permissions),
    },
  });

  const queryClient = useQueryClient();

  const { mutate: updatePermissions, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const permissions = values.permissions.reduce<InstancePermission[]>(
        (result, permission) => {
          if (!permission.value) {
            return result;
          }
          if (permission.name === 'manageInstanceSettings') {
            result.push({ subject: 'InstanceConfig', action: ['manage'] });
          }
          if (permission.name === 'manageInstanceRoles') {
            result.push({ subject: 'InstanceRole', action: ['manage'] });
          }
          if (permission.name === 'manageServers') {
            result.push({ subject: 'Server', action: ['manage'] });
          }
          return result;
        },
        [],
      );

      await api.updateInstanceRolePermissions(instanceRole.id, {
        permissions,
      });

      queryClient.setQueryData<{ instanceRole: InstanceRoleRes }>(
        ['instance-roles', instanceRole.id],
        (oldData) => {
          if (!oldData) {
            return { instanceRole };
          }
          return { instanceRole: { ...oldData.instanceRole, permissions } };
        },
      );
      queryClient.setQueryData<{ instanceRoles: InstanceRoleRes[] }>(
        ['instance-roles'],
        (data) => {
          if (!data) {
            return data;
          }
          return {
            instanceRoles: data.instanceRoles.map((role) =>
              role.id === instanceRole.id ? { ...role, permissions } : role,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
      reset({
        permissions: getInstancePermissionValues(permissions),
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
            {INSTANCE_PERMISSION_KEYS.map((permissionName, index) => (
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
