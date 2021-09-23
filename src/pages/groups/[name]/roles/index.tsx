import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { CircularProgress, Card, Typography } from "@material-ui/core";
import { useRouter } from "next/router";

import Role from "../../../../components/Roles/Role";
import { ROLES_BY_GROUP_ID } from "../../../../apollo/client/queries";
import RoleForm from "../../../../components/Roles/Form";
import { noCache } from "../../../../utils/apollo";
import Messages from "../../../../utils/messages";
import { useGroupByName, useHasPermissionByGroupId } from "../../../../hooks";
import { GroupPermissions } from "../../../../constants/role";
import { breadcrumbsVar } from "../../../../apollo/client/localState";
import { ResourcePaths, TypeNames } from "../../../../constants/common";

const GroupRolesIndex = () => {
  const { query } = useRouter();
  const [group, _, groupLoading] = useGroupByName(query.name);
  const [roles, setRoles] = useState<ClientRole[]>([]);
  const [getRolesRes, rolesRes] = useLazyQuery(ROLES_BY_GROUP_ID, noCache);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionByGroupId(
    GroupPermissions.ManageRoles,
    group?.id,
    roles
  );

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

  if (canManageRolesLoading || groupLoading || rolesRes.loading)
    return <CircularProgress />;
  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;
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
