import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  CircularProgress,
  Card,
  makeStyles,
  Typography,
  Button,
} from "@material-ui/core";

import Role from "../../components/Roles/Role";
import { GLOBAL_ROLES } from "../../apollo/client/queries";
import {
  DELETE_ROLE,
  INITIALIZE_ADMIN_ROLE,
} from "../../apollo/client/mutations";
import RoleForm from "../../components/Roles/Form";
import { noCache } from "../../utils/apollo";
import styles from "../../styles/Role/Role.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";
import { Roles } from "../../constants";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
});

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
  const classes = useStyles();

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
        <Typography style={{ marginBottom: 12 }}>
          {Messages.roles.noRoles()}
        </Typography>
        <Button
          onClick={() =>
            window.confirm(
              Messages.roles.prompts.initializeAdminRoleConfirm()
            ) && initializeAdminRoleHandler()
          }
          variant="contained"
          style={{ color: "white", backgroundColor: "rgb(65, 65, 65)" }}
        >
          {Messages.roles.actions.initializeAdminRole()}
        </Button>
      </>
    );

  if (canManageRolesLoading || rolesRes.loading)
    return <CircularProgress style={{ color: "white" }} />;

  if (canManageRoles)
    return (
      <>
        <Typography variant="h4" style={{ marginBottom: 24 }}>
          {Messages.roles.serverRoles()}
        </Typography>

        <RoleForm roles={roles} setRoles={setRoles} />

        <Card className={classes.root + " " + styles.card}>
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
