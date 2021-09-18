import React, { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { Button, Card, CircularProgress, Tab, Tabs } from "@material-ui/core";

import {
  ROLE,
  PERMISSIONS_BY_ROLE_ID,
  ROLE_MEMBERS,
  GROUP_BY_NAME,
} from "../../../../../apollo/client/queries";
import { DELETE_ROLE } from "../../../../../apollo/client/mutations";
import RoleForm from "../../../../../components/Roles/Form";
import { noCache } from "../../../../../utils/apollo";
import Messages from "../../../../../utils/messages";
import { useHasPermissionByGroupId } from "../../../../../hooks";
import styles from "../../../../../styles/Role/Role.module.scss";
import { GroupPermissions } from "../../../../../constants/role";
import {
  ModelNames,
  NavigationPaths,
  ResourcePaths,
  TypeNames,
} from "../../../../../constants/common";
import PermissionsForm from "../../../../../components/Permissions/Form";
import AddMemberTab from "../../../../../components/Roles/AddMemberTab";
import { breadcrumbsVar } from "../../../../../apollo/client/localState";

const EditGroupRolePage = () => {
  const { query } = useRouter();
  const [role, setRole] = useState<ClientRole>();
  const [group, setGroup] = useState<ClientGroup>();
  const [permissions, setPermissions] = useState<ClientPermission[]>([]);
  const [unsavedPermissions, setUnsavedPermissions] = useState<
    ClientPermission[]
  >([]);
  const [members, setMembers] = useState<ClientRoleMember[]>([]);
  const [tab, setTab] = useState<number>(0);
  const [canManageRolesDep, setCanManageRolesDep] = useState<string>("");
  const [getRoleRes, roleRes] = useLazyQuery(ROLE, noCache);
  const [getPermissionsRes, permissionsRes] = useLazyQuery(
    PERMISSIONS_BY_ROLE_ID,
    noCache
  );
  const [getMembersRes, membersRes] = useLazyQuery(ROLE_MEMBERS, noCache);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const [deleteRole] = useMutation(DELETE_ROLE);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionByGroupId(
    GroupPermissions.ManageRoles,
    group?.id,
    [members, canManageRolesDep]
  );

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
    if (query.name) {
      getGroupRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

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
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (role && group && canManageRoles)
      breadcrumbsVar([
        {
          label: group.name,
          href: `${ResourcePaths.Group}${group.name}`,
        },
        {
          label: Messages.roles.breadcrumbs.groupRoles(),
          href: `${ResourcePaths.Group}${group.name}${NavigationPaths.Roles}`,
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
    Router.push(`${ResourcePaths.Group}${group?.name}${NavigationPaths.Roles}`);
  };

  const anyUnsavedPermissions = (): boolean => {
    return (
      Boolean(unsavedPermissions.length) &&
      JSON.stringify(permissions) !== JSON.stringify(unsavedPermissions)
    );
  };

  if (
    canManageRolesLoading ||
    roleRes.loading ||
    permissionsRes.loading ||
    membersRes.loading ||
    groupRes.loading
  )
    return <CircularProgress />;
  if (!canManageRoles) return <>{Messages.users.permissionDenied()}</>;
  if (!role) return <>{Messages.items.notFound(TypeNames.Role)}</>;

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
          <RoleForm role={role} setRole={setRole} isEditing={true} />

          <Button
            onClick={() =>
              window.confirm(Messages.prompts.deleteItem(ModelNames.Role)) &&
              deleteRoleHandler(role.id)
            }
            className={styles.deleteButton}
            style={{
              color: "tomato",
              backgroundColor: "rgb(55, 55, 55)",
            }}
            variant="text"
          >
            {Messages.actions.deleteItem(TypeNames.Role)}
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
          roleMembers={members}
          setRoleMembers={setMembers}
          membersLoading={membersRes.loading}
          group={group}
        />
      )}
    </>
  );
};

export default EditGroupRolePage;
