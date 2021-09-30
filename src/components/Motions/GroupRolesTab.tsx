import { useEffect, useState } from "react";
import {
  FormControl,
  FormGroup,
  InputLabel,
  LinearProgress,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { Field, Form, Formik, FormikProps } from "formik";
import { useLazyQuery } from "@apollo/client";
import { ColorResult } from "react-color";

import {
  DEFAULT_ROLE_COLOR,
  INITIAL_GROUP_PERMISSIONS,
} from "../../constants/role";
import Messages from "../../utils/messages";
import CancelButton from "../Shared/CancelButton";
import ColorPicker from "../Shared/ColorPicker";
import SubmitButton from "../Shared/SubmitButton";
import TextField from "../Shared/TextField";
import styles from "../../styles/Shared/Shared.module.scss";
import { noCache } from "../../utils/clientIndex";
import {
  PERMISSIONS_BY_ROLE_ID,
  ROLES_BY_GROUP_ID,
} from "../../apollo/client/queries";
import { ActionTypes } from "../../constants/motion";
import Dropdown from "../Shared/Dropdown";
import { useMembersByGroupId } from "../../hooks";
import PermissionToggles from "../Permissions/Toggles";
import { FieldNames } from "../../constants/common";
import UserName from "../Users/Name";

interface FormValues {
  name: string;
}

interface Props {
  groupId: string;
  action: string;
  setSelectedGroupId: (id: string) => void;
  setActionData: (actionData: ActionData | undefined) => void;
  setAction: (action: string) => void;
  resetTabs: () => void;
}

const GroupRolesTab = ({
  groupId,
  action,
  setSelectedGroupId,
  setActionData,
  setAction,
  resetTabs,
}: Props) => {
  const [color, setColor] = useState<string>(DEFAULT_ROLE_COLOR);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [roles, setRoles] = useState<ClientRole[]>([]);
  const [permissions, setPermissions] = useState<ClientPermission[]>([]);
  const [unsavedPermissions, setUnsavedPermissions] = useState<
    ClientPermission[]
  >([]);
  const [getRolesRes, rolesRes] = useLazyQuery(ROLES_BY_GROUP_ID, noCache);
  const [getPermissionsRes, permissionsRes] = useLazyQuery(
    PERMISSIONS_BY_ROLE_ID,
    noCache
  );
  const [groupMembers, _, groupMembersLoading] = useMembersByGroupId(groupId);
  const roleBySelectedId = roles.find((role) => role.id === selectedRoleId);
  const initialValues: FormValues = {
    name: roleBySelectedId ? roleBySelectedId.name : "",
  };
  const isCreatingRole = action === ActionTypes.CreateRole;
  const isChangingRole = action === ActionTypes.ChangeRole;
  const isAssigningRole = action === ActionTypes.AssignRole;

  useEffect(() => {
    if (groupId)
      getRolesRes({
        variables: { groupId },
      });
  }, [groupId]);

  useEffect(() => {
    if (selectedRoleId && isChangingRole) {
      getPermissionsRes({
        variables: {
          roleId: selectedRoleId,
        },
      });
    }
  }, [selectedRoleId, action]);

  useEffect(() => {
    if (rolesRes.data) setRoles(rolesRes.data.rolesByGroupId);
  }, [rolesRes.data]);

  useEffect(() => {
    if (permissionsRes.data)
      setPermissions(permissionsRes.data.permissionsByRoleId);
  }, [permissionsRes.data]);

  useEffect(() => {
    if (isCreatingRole)
      setPermissions(INITIAL_GROUP_PERMISSIONS as ClientPermission[]);
  }, [action]);

  useEffect(() => {
    if (isChangingRole && roleBySelectedId) setColor(roleBySelectedId.color);
  }, [isChangingRole, roleBySelectedId]);

  const handleSubmit = ({ name }: FormValues) => {
    if (isCreatingRole || isChangingRole)
      setActionData({
        groupRole: { name, color },
        groupRolePermissions: changedPermissions(),
        ...(isChangingRole && {
          groupRoleId: selectedRoleId,
        }),
      });
    if (isAssigningRole)
      setActionData({
        groupRoleId: selectedRoleId,
        userId: assigneeId,
      });
    resetTabs();
  };

  const handleCancel = () => {
    setSelectedGroupId("");
    setActionData(undefined);
    setAction("");
    resetTabs();
  };

  const changedPermissions = (): InitialPermission[] => {
    const changed = unsavedPermissions.filter(
      (unsavedPermission) =>
        !permissions.some(
          (permission) =>
            unsavedPermission.name === permission.name &&
            unsavedPermission.enabled === permission.enabled
        )
    );
    return changed.map(({ name, enabled }) => {
      return { name, enabled };
    });
  };

  const handleColorChange = (color: ColorResult) => {
    setColor(color.hex);
  };

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRoleId(event.target.value as string);
  };

  const handleAssigneeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setAssigneeId(event.target.value as string);
  };

  const isSubmitButtonDisabled = ({
    isSubmitting,
    dirty,
  }: FormikProps<FormValues>): boolean => {
    if (anyUnsavedColor() || changedPermissions().length) return false;
    if (!dirty) return true;
    return isSubmitting;
  };

  const anyUnsavedColor = (): boolean => {
    return roleBySelectedId?.color !== color;
  };

  const actionLabel = (): string => {
    const actionTypes = Messages.motions.form.actionTypes;
    switch (action) {
      case ActionTypes.CreateRole:
        return actionTypes.createRole();
      case ActionTypes.ChangeRole:
        return actionTypes.changeRole();
      case ActionTypes.AssignRole:
        return actionTypes.assignRole();
      default:
        return "";
    }
  };

  if (rolesRes.loading || permissionsRes.loading || groupMembersLoading)
    return <LinearProgress />;

  return (
    <>
      <Typography gutterBottom>{actionLabel()}</Typography>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formik) => (
          <Form>
            <FormGroup>
              {(isChangingRole || isAssigningRole) && (
                <FormControl style={{ marginBottom: 6 }}>
                  <InputLabel>
                    {Messages.motions.form.inputLabels.role()}
                  </InputLabel>
                  <Dropdown value={selectedRoleId} onChange={handleRoleChange}>
                    {roles.map((role) => (
                      <MenuItem value={role.id} key={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Dropdown>
                </FormControl>
              )}

              {isAssigningRole && (
                <FormControl style={{ marginBottom: 18 }}>
                  <InputLabel>
                    {Messages.motions.form.inputLabels.member()}
                  </InputLabel>
                  <Dropdown value={assigneeId} onChange={handleAssigneeChange}>
                    {groupMembers.map((member) => (
                      <MenuItem value={member.userId} key={member.id}>
                        <UserName userId={member.userId} />
                      </MenuItem>
                    ))}
                  </Dropdown>
                </FormControl>
              )}

              {(isCreatingRole || isChangingRole) && (
                <>
                  <Field
                    name={FieldNames.Name}
                    placeholder={Messages.roles.form.name()}
                    component={TextField}
                    autoComplete="off"
                  />
                  <ColorPicker
                    color={color}
                    onChange={handleColorChange}
                    label={Messages.roles.form.colorPickerLabel()}
                  />
                </>
              )}
            </FormGroup>

            {(isCreatingRole || isChangingRole) && (
              <PermissionToggles
                permissions={permissions}
                unsavedPermissions={unsavedPermissions}
                setUnsavedPermissions={setUnsavedPermissions}
              />
            )}

            <div className={styles.flexEnd}>
              <CancelButton
                onClick={handleCancel}
                style={{ marginRight: 12 }}
              />

              <SubmitButton disabled={isSubmitButtonDisabled(formik)}>
                {Messages.actions.confirm()}
              </SubmitButton>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default GroupRolesTab;
