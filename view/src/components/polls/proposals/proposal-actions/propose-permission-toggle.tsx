import { getPermissionText } from '@/lib/role.utils';
import { type ServerPermissionKeys } from '@/types/role.types';
import { type UseFormSetValue } from 'react-hook-form';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { type CreateProposalFormSchema } from '../create-proposal-form/create-proposal-form.types';

interface Props {
  permissionName: ServerPermissionKeys;
  formPermissions: CreateProposalFormSchema['permissions'];
  setValue: UseFormSetValue<CreateProposalFormSchema>;
}

export const ProposePermissionToggle = ({
  formPermissions,
  permissionName,
  setValue,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  if (!formPermissions) {
    return null;
  }

  const handleSwitchChange = (checked: boolean) => {
    setValue('permissions', {
      ...formPermissions,
      [permissionName]: checked,
    });
  };

  return (
    <div className="flex items-center justify-between space-x-2 py-2">
      <div className="space-y-1">
        <Label
          htmlFor={`permission-${permissionName}`}
          className="text-sm font-medium"
        >
          {displayName}
        </Label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>

      <Switch
        id={`permission-${permissionName}`}
        defaultChecked={formPermissions[permissionName]}
        onCheckedChange={handleSwitchChange}
        aria-label={displayName}
      />
    </div>
  );
};
