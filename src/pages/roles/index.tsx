import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress, Card, Typography } from "@material-ui/core";
import { AccountBox } from "@material-ui/icons";

import Role from "../../components/Roles/Role";
import { GLOBAL_ROLES } from "../../apollo/client/queries";
import { INITIALIZE_ADMIN_ROLE } from "../../apollo/client/mutations";
import RoleForm from "../../components/Roles/Form";
import { errorToast, noCache } from "../../utils/clientIndex";
import Messages from "../../utils/messages";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";
import { GlobalPermissions } from "../../constants/role";
import GhostButton from "../../components/Shared/GhostButton";

const Index = () => {
  const currentUser = useCurrentUser();
  const [roles, setRoles] = useState<ClientRole[]>([]);
  const [initializeAdminRole] = useMutation(INITIALIZE_ADMIN_ROLE);
  const rolesRes = useQuery(GLOBAL_ROLES, noCache);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionGlobally(
    GlobalPermissions.ManageRoles,
    roles
  );

  useEffect(() => {
    if (rolesRes.data) setRoles(rolesRes.data.globalRoles);
  }, [rolesRes.data]);

  const initializeAdminRoleHandler = async () => {
    try {
      const { data } = await initializeAdminRole({
        variables: {
          userId: currentUser?.id,
        },
      });
      setRoles([data.initializeAdminRole.role]);
    } catch (err) {
      errorToast(err);
    }
  };

  if (rolesRes.data && roles.length === 0)
    return (
      <>
        <Typography gutterBottom>{Messages.roles.noRoles()}</Typography>
        <GhostButton
          onClick={() =>
            window.confirm(
              Messages.roles.prompts.initializeAdminRoleConfirm()
            ) && initializeAdminRoleHandler()
          }
        >
          <AccountBox style={{ marginRight: 5 }} />
          {Messages.roles.actions.initializeAdminRole()}
        </GhostButton>
      </>
    );

  if (canManageRolesLoading || rolesRes.loading) return <CircularProgress />;
  if (!canManageRoles) return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {Messages.roles.serverRoles()}
      </Typography>

      <RoleForm roles={roles} setRoles={setRoles} />

      <Card>
        {roles
          .slice()
          .reverse()
          .map((role: ClientRole) => {
            return <Role role={role} key={role.id} />;
          })}
      </Card>
    </>
  );
};

export default Index;
