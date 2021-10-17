import React, { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { Card, CircularProgress, Tab, Tabs } from "@material-ui/core";

import { ROLE } from "../../../apollo/client/queries";
import { DELETE_ROLE } from "../../../apollo/client/mutations";
import RoleForm from "../../../components/Roles/Form";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import {
  useHasPermissionGlobally,
  useMembersByRoleId,
  usePermissionsByRoleId,
} from "../../../hooks";
import styles from "../../../styles/Role/Role.module.scss";
import { GlobalPermissions } from "../../../constants/role";
import {
  ModelNames,
  NavigationPaths,
  TypeNames,
} from "../../../constants/common";
import PermissionsForm from "../../../components/Permissions/Form";
import AddMemberTab from "../../../components/Roles/AddMemberTab";
import { breadcrumbsVar } from "../../../apollo/client/localState";
import DeleteButton from "../../../components/Shared/DeleteButton";

const Edit = () => {
  const { query } = useRouter();
  const [role, setRole] = useState<ClientRole>();
  const [unsavedPermissions, setUnsavedPermissions] = useState<
    ClientPermission[]
  >([]);
  const [tab, setTab] = useState(0);
  const [canManageRolesDep, setCanManageRolesDep] = useState("");
  const [getRoleRes, roleRes] = useLazyQuery(ROLE, noCache);
  const [deleteRole] = useMutation(DELETE_ROLE);
  const [members, setMembers, membersLoading] = useMembersByRoleId(query.id);
  const [permissions, setPermissions, permissionsLoading] =
    usePermissionsByRoleId(query.id);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionGlobally(
    GlobalPermissions.ManageRoles,
    [members, canManageRolesDep]
  );

  useEffect(() => {
    if (query.id) {
      getRoleRes({
        variables: { id: query.id },
      });
    }
  }, [query.id]);

  useEffect(() => {
    if (roleRes.data) setRole(roleRes.data.role);
  }, [roleRes.data]);

  useEffect(() => {
    if (role && canManageRoles)
      breadcrumbsVar([
        {
          label: Messages.roles.serverRoles(),
          href: NavigationPaths.Roles,
        },
        { label: role.name },
      ]);
    else breadcrumbsVar([]);

    return () => {
      breadcrumbsVar([]);
    };
  }, [role, canManageRoles]);

  const deleteRoleHandler = async (id: string) => {
    await deleteRole({
      variables: {
        id,
      },
    });
    Router.push(NavigationPaths.Roles);
  };

  const anyUnsavedPermissions = (): boolean => {
    return (
      Boolean(unsavedPermissions.length) &&
      JSON.stringify(permissions) !== JSON.stringify(unsavedPermissions)
    );
  };

  if (canManageRolesLoading || roleRes.loading || permissionsLoading)
    return <CircularProgress />;

  if (role && canManageRoles)
    return (
      <>
        <Card className={styles.tabsCard}>
          <Tabs
            textColor="inherit"
            centered
            value={tab}
            onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
              setTab(newValue)
            }
          >
            <Tab label={Messages.roles.tabs.display()} />
            <Tab label={Messages.roles.tabs.permissions()} />
            <Tab label={Messages.roles.tabs.members()} />
          </Tabs>
        </Card>

        {tab === 0 && (
          <>
            <RoleForm role={role} setRole={setRole} isEditing />

            <DeleteButton
              onClick={() =>
                window.confirm(Messages.prompts.deleteItem(ModelNames.Role)) &&
                deleteRoleHandler(role.id)
              }
            >
              {Messages.actions.deleteItem(TypeNames.Role)}
            </DeleteButton>
          </>
        )}

        {tab === 1 && (
          <PermissionsForm
            permissions={permissions}
            setPermissions={setPermissions}
            unsavedPermissions={unsavedPermissions}
            setUnsavedPermissions={setUnsavedPermissions}
            anyUnsavedPermissions={anyUnsavedPermissions()}
            setCanManageRolesDep={setCanManageRolesDep}
          />
        )}

        {tab === 2 && (
          <AddMemberTab
            role={role}
            roleMembers={members}
            setRoleMembers={setMembers}
            membersLoading={membersLoading}
          />
        )}
      </>
    );

  return <>{Messages.users.permissionDenied()}</>;
};

export default Edit;
