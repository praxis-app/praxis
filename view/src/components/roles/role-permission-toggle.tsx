import { Switch } from '@/components/ui/switch';
import { getPermissionText } from '@/lib/role.utils';
import {
  type InstancePermissionKeys,
  type ServerPermissionKeys,
} from '@/types/role.types';
import { t } from 'i18next';

type PermissionKey = ServerPermissionKeys | InstancePermissionKeys;

interface Props {
  permissionName: PermissionKey;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const RolePermissionToggle = ({
  permissionName,
  checked,
  onChange,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  return (
    <div className="mb-7 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={displayName || t('labels.switch')}
      />
    </div>
  );
};
