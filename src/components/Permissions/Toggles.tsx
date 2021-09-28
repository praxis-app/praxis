import { useEffect } from "react";
import { FormGroup, Switch, Typography } from "@material-ui/core";
import {
  permissionDescription,
  permissionDisplayName,
} from "../../utils/clientIndex";
import styles from "../../styles/Role/Role.module.scss";

interface Props {
  permissions: ClientPermission[];
  unsavedPermissions: ClientPermission[];
  setUnsavedPermissions: (permissions: ClientPermission[]) => void;
}

const PermissionToggles = ({
  permissions,
  unsavedPermissions,
  setUnsavedPermissions,
}: Props) => {
  useEffect(() => {
    setUnsavedPermissions(permissions);
  }, [permissions]);

  const handleSwitchChange = (name: string, enabled: boolean) => {
    setByName(name, enabled);
  };

  const setByName = (name: string, enabled: boolean) => {
    setUnsavedPermissions(
      unsavedPermissions.map((permission) => {
        if (permission.name === name)
          return {
            ...permission,
            enabled,
          };
        return permission;
      })
    );
  };

  return (
    <FormGroup>
      {unsavedPermissions.map(({ name, enabled }) => {
        return (
          <div className={styles.permission} key={name}>
            <div>
              <Typography>{permissionDisplayName(name)}</Typography>
              <div className={styles.permissionDescription}>
                {permissionDescription(name)}
              </div>
            </div>

            <Switch
              checked={enabled}
              onChange={() => handleSwitchChange(name, !enabled)}
              color="primary"
            />
          </div>
        );
      })}
    </FormGroup>
  );
};

export default PermissionToggles;
