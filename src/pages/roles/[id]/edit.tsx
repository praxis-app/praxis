import React, { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import Router, { useRouter } from "next/router";
import {
  Button,
  Card,
  CircularProgress,
  makeStyles,
  Tab,
  Tabs,
} from "@material-ui/core";

import {
  ROLE,
  PERMISSIONS_BY_ROLE_ID,
  ROLE_MEMBERS,
} from "../../../apollo/client/queries";
import { DELETE_ROLE } from "../../../apollo/client/mutations";
import RoleForm from "../../../components/Roles/Form";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import { useHasPermissionGlobally } from "../../../hooks";
import styles from "../../../styles/Role/Role.module.scss";
import { Common, Roles } from "../../../constants";
import PermissionsForm from "../../../components/Permissions/Form";
import AddMemberTab from "../../../components/Roles/AddMemberTab";
import { breadcrumbsVar } from "../../../apollo/client/localState";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
  },
  indicator: {
    backgroundColor: "white",
  },
});

const Edit = () => {
  const { query } = useRouter();
  const [role, setRole] = useState<Role>();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [unsavedPermissions, setUnsavedPermissions] = useState<Permission[]>(
    []
  );
  const [members, setMembers] = useState<RoleMember[]>([]);
  const [tab, setTab] = useState<number>(0);
  const [canManageRolesDep, setCanManageRolesDep] = useState<string>("");
  const [getRoleRes, roleRes] = useLazyQuery(ROLE, noCache);
  const [getPermissionsRes, permissionsRes] = useLazyQuery(
    PERMISSIONS_BY_ROLE_ID,
    noCache
  );
  const [getMembersRes, membersRes] = useLazyQuery(ROLE_MEMBERS, noCache);
  const [deleteRole] = useMutation(DELETE_ROLE);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionGlobally(
    Roles.Permissions.ManageRoles,
    [members, canManageRolesDep]
  );
  const classes = useStyles();

  useEffect(() => {
    if (query.id) {
      getRoleRes({
        variables: { id: query.id },
      });
      const byRoleId = {
        variables: {
          roleId: query.id,
        },
      };
      getPermissionsRes(byRoleId);
      getMembersRes(byRoleId);
    }
  }, [query.id]);

  useEffect(() => {
    if (roleRes.data) setRole(roleRes.data.role);
  }, [roleRes.data]);

  useEffect(() => {
    if (permissionsRes.data)
      setPermissions(permissionsRes.data.permissionsByRoleId);
  }, [permissionsRes.data]);

  useEffect(() => {
    if (membersRes.data) setMembers(membersRes.data.roleMembers);
  }, [membersRes.data]);

  useEffect(() => {
    if (permissions.length && !unsavedPermissions.length)
      setUnsavedPermissions(permissions);
  }, [permissions]);

  useEffect(() => {
    if (role && canManageRoles)
      breadcrumbsVar([
        { label: Messages.roles.breadcrumb(), href: "/roles" },
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
    Router.push("/roles");
  };

  const anyUnsavedPermissions = (): boolean => {
    return (
      !!unsavedPermissions.length &&
      JSON.stringify(permissions) !== JSON.stringify(unsavedPermissions)
    );
  };

  if (canManageRolesLoading && permissionsRes.loading)
    return <CircularProgress style={{ color: "white" }} />;

  if (role && canManageRoles)
    return (
      <>
        <Card className={classes.root + " " + styles.tabsCard}>
          <Tabs
            textColor="inherit"
            centered
            value={tab}
            onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
              setTab(newValue)
            }
            classes={{ indicator: classes.indicator }}
          >
            <Tab label="Display" style={{ color: "white" }} />
            <Tab label="Permissions" style={{ color: "white" }} />
            <Tab label="Members" style={{ color: "white" }} />
          </Tabs>
        </Card>

        {tab === 0 && (
          <>
            <RoleForm role={role} setRole={setRole} isEditing={true} />

            <Button
              onClick={() =>
                window.confirm(
                  Messages.prompts.deleteItem(Common.ModelNames.Role)
                ) && deleteRoleHandler(role.id)
              }
              style={{
                color: "tomato",
                backgroundColor: "rgb(55, 55, 55)",
              }}
              className={styles.card}
              variant="text"
            >
              {Messages.actions.deleteItem(Common.TypeNames.Role)}
            </Button>
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
            members={members}
            setMembers={setMembers}
            membersLoading={membersRes.loading}
          />
        )}
      </>
    );

  return <>{Messages.users.permissionDenied()}</>;
};

export default Edit;
