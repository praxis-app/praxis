import { Switch } from '@/components/ui/switch';
import { getPermissionText } from '@/lib/role.utils';
import { cn } from '@/lib/shared.utils';
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
  className?: string;
}

export const RolePermissionToggle = ({
  permissionName,
  checked,
  onChange,
  className,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName);

  return (
    <div
      className={cn('mb-7 flex items-start justify-between gap-4', className)}
    >
      <div>
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-muted-foreground mt-1 text-xs text-pretty">
          {description}
        </p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={displayName || t('labels.switch')}
      />
    </div>
  );
};
