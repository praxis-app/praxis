import { useEffect } from "react";
import { CircularProgress, Card, Typography } from "@material-ui/core";
import { useRouter } from "next/router";

import Role from "../../../../components/Roles/Role";
import RoleForm from "../../../../components/Roles/Form";
import Messages from "../../../../utils/messages";
import {
  useGroupByName,
  useHasPermissionByGroupId,
  useRolesByGroupId,
} from "../../../../hooks";
import { GroupPermissions } from "../../../../constants/role";
import { breadcrumbsVar } from "../../../../apollo/client/localState";
import { ResourcePaths, TypeNames } from "../../../../constants/common";

const GroupRolesIndex = () => {
  const { query } = useRouter();
  const [group, _, groupLoading] = useGroupByName(query.name);
  const [roles, setRoles, rolesLoading] = useRolesByGroupId(group?.id);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionByGroupId(
    GroupPermissions.ManageRoles,
    group?.id,
    roles
  );

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

  if (canManageRolesLoading || groupLoading || rolesLoading)
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
