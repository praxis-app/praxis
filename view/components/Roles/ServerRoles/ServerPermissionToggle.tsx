import { ServerRolePermissionInput } from '../../../apollo/gen';
import PermissionToggle from '../PermissionToggle';
import { ServerRolePermissionsFragment } from './ServerPermissionsForm/generated/ServerRolePermissions.fragment';

interface Props {
  formValues: ServerRolePermissionInput;
  permissionName: keyof ServerRolePermissionInput;
  permissions: ServerRolePermissionsFragment;
  setFieldValue(field: string, value?: boolean): void;
}

const ServerPermissionToggle = ({
  formValues,
  permissionName,
  permissions,
  setFieldValue,
}: Props) => {
  const permissionInput = formValues[permissionName];
  const isEnabled = permissions[permissionName];

  return (
    <PermissionToggle
      permissionName={permissionName}
      isEnabled={isEnabled}
      setFieldValue={setFieldValue}
      permissionInput={permissionInput}
    />
  );
};

export default ServerPermissionToggle;
