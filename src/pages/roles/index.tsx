import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress, Card, Typography, Button } from "@material-ui/core";

import Role from "../../components/Roles/Role";
import { GLOBAL_ROLES } from "../../apollo/client/queries";
import {
  DELETE_ROLE,
  INITIALIZE_ADMIN_ROLE,
} from "../../apollo/client/mutations";
import RoleForm from "../../components/Roles/Form";
import { noCache } from "../../utils/apollo";
import Messages from "../../utils/messages";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";
import { Roles } from "../../constants";

const Index = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [deleteRole] = useMutation(DELETE_ROLE);
  const [initializeAdminRole] = useMutation(INITIALIZE_ADMIN_ROLE);
  const rolesRes = useQuery(GLOBAL_ROLES, noCache);
  const [canManageRoles, canManageRolesLoading] = useHasPermissionGlobally(
    Roles.Permissions.ManageRoles,
    roles
  );
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (rolesRes.data) setRoles(rolesRes.data.globalRoles);
  }, [rolesRes.data]);

  const deleteRoleHandler = async (id: string) => {
    await deleteRole({
      variables: {
        id,
      },
    });
    if (roles) setRoles(roles.filter((role: Role) => role.id !== id));
  };

  const initializeAdminRoleHandler = async () => {
    try {
      const { data } = await initializeAdminRole({
        variables: {
          userId: currentUser?.id,
        },
      });
      setRoles([data.initializeAdminRole.role]);
    } catch (err) {
      alert(err);
    }
  };

  if (rolesRes.data && roles.length === 0)
    return (
      <>
        <Typography gutterBottom>{Messages.roles.noRoles()}</Typography>
        <Button
          onClick={() =>
            window.confirm(
              Messages.roles.prompts.initializeAdminRoleConfirm()
            ) && initializeAdminRoleHandler()
          }
          variant="contained"
          color="primary"
        >
          {Messages.roles.actions.initializeAdminRole()}
        </Button>
      </>
    );

  if (canManageRolesLoading || rolesRes.loading) return <CircularProgress />;

  if (canManageRoles)
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
            .map((role: Role) => {
              return (
                <Role
                  role={role}
                  deleteRole={deleteRoleHandler}
                  key={role.id}
                />
              );
            })}
        </Card>
      </>
    );

  return <>{Messages.users.permissionDenied()}</>;
};

export default Index;
