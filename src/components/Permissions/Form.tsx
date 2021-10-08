import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import styles from "../../styles/Role/Role.module.scss";
import { UPDATE_PERMISSIONS } from "../../apollo/client/mutations";
import { navKeyVar } from "../../apollo/client/localState";
import SubmitButton from "../Shared/SubmitButton";
import Messages from "../../utils/messages";
import { errorToast, generateRandom } from "../../utils/clientIndex";
import PermissionToggles from "./Toggles";

interface Props {
  permissions: ClientPermission[];
  setPermissions: (permissions: ClientPermission[]) => void;
  unsavedPermissions: ClientPermission[];
  setUnsavedPermissions: (permissions: ClientPermission[]) => void;
  anyUnsavedPermissions: boolean;
  setCanManageRolesDep?: (dependency: string) => void;
}

const PermissionsForm = ({
  permissions,
  setPermissions,
  unsavedPermissions,
  setUnsavedPermissions,
  anyUnsavedPermissions,
  setCanManageRolesDep,
}: Props) => {
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [updatePermissions] = useMutation(UPDATE_PERMISSIONS);

  useEffect(() => {
    setUnsavedPermissions(permissions);
  }, [permissions]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const { data } = await updatePermissions({
        variables: {
          permissions: unsavedPermissions.map(({ id, enabled }) => {
            return { id, enabled };
          }),
        },
      });
      const newPermissions = data.updatePermissions.permissions;
      setUnsavedPermissions(newPermissions);
      setPermissions(newPermissions);
      const newKey = generateRandom();
      navKeyVar(newKey);
      if (setCanManageRolesDep) setCanManageRolesDep(newKey);
    } catch (err) {
      errorToast(err);
    }
    setSubmitLoading(false);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className={styles.form}>
      <PermissionToggles
        permissions={permissions}
        unsavedPermissions={unsavedPermissions}
        setUnsavedPermissions={setUnsavedPermissions}
      />

      <div className={styles.flexEnd}>
        <SubmitButton disabled={!anyUnsavedPermissions}>
          {submitLoading ? Messages.states.saving() : Messages.actions.save()}
        </SubmitButton>
      </div>
    </form>
  );
};

export default PermissionsForm;
