import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { CircularProgress, Card } from "@material-ui/core";
import { useRouter } from "next/router";

import Role from "../../../../components/Roles/Role";
import {
  ROLES_BY_GROUP_ID,
  GROUP_BY_NAME,
} from "../../../../apollo/client/queries";
import RoleForm from "../../../../components/Roles/Form";
import { noCache } from "../../../../utils/apollo";
import Messages from "../../../../utils/messages";
import { useHasPermissionByGroupId } from "../../../../hooks";
import { GroupPermissions } from "../../../../constants/role";
import { breadcrumbsVar } from "../../../../apollo/client/localState";
import { ResourcePaths } from "../../../../constants/common";

const GroupRolesIndex = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<ClientGroup>();
  const [roles, setRoles] = useState<ClientRole[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const [getRolesRes, rolesRes] = useLazyQuery(ROLES_BY_GROUP_ID, noCache);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionByGroupId(
    GroupPermissions.ManageRoles,
    group?.id,
    roles
  );

  useEffect(() => {
    if (query.name) {
      getGroupRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (group)
      getRolesRes({
        variables: { groupId: group.id },
      });
  }, [group]);

  useEffect(() => {
    if (rolesRes.data) setRoles(rolesRes.data.rolesByGroupId);
  }, [rolesRes.data]);

  useEffect(() => {
    if (group && canManageRoles)
      breadcrumbsVar([
        {
          label: group.name,
          href: `${ResourcePaths.Group}${group.name}`,
        },
        {
          label: Messages.groups.breadcrumbs.groupRoles(),
        },
      ]);
    else breadcrumbsVar([]);

    return () => {
      breadcrumbsVar([]);
    };
  }, [group, canManageRoles]);

  if (canManageRolesLoading || rolesRes.loading || groupRes.loading)
    return <CircularProgress />;
  if (!canManageRoles) return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      <RoleForm roles={roles} setRoles={setRoles} group={group} />

      <Card>
        {roles
          .slice()
          .reverse()
          .map((role: ClientRole) => {
            return <Role role={role} group={group} key={role.id} />;
          })}
      </Card>
    </>
  );
};

export default GroupRolesIndex;
