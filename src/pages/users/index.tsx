import { useMutation } from "@apollo/client";
import { CircularProgress, Typography } from "@material-ui/core";
import Router from "next/router";

import User from "../../components/Users/User";
import { DELETE_USER, LOGOUT_USER } from "../../apollo/client/mutations";
import { PageSizes } from "../../constants/common";
import { Permissions } from "../../constants/role";
import {
  useAllUsers,
  useCurrentUser,
  useHasPermissionGlobally,
} from "../../hooks";
import Messages from "../../utils/messages";

const Index = () => {
  const currentUser = useCurrentUser();
  const [users, setUsers, usersLoading] = useAllUsers();
  const [deleteUser] = useMutation(DELETE_USER);
  const [logoutUser] = useMutation(LOGOUT_USER);
  const [canManageUsers, canManageUsersLoading] = useHasPermissionGlobally(
    Permissions.ManageUsers
  );

  const deleteUserHandler = async (userId: string) => {
    await deleteUser({
      variables: {
        id: userId,
      },
    });
    if (users) setUsers(users.filter((user: User) => user.id !== userId));

    if (currentUser?.id === userId) {
      await logoutUser();
      Router.push("/");
    }
  };

  if (canManageUsersLoading || usersLoading) return <CircularProgress />;

  if (canManageUsers)
    return (
      <>
        <Typography variant="h4" gutterBottom>
          {Messages.navigation.users()}
        </Typography>

        {users
          .slice()
          .reverse()
          .slice(0, PageSizes.Default)
          .map((user: User) => {
            return (
              <User user={user} deleteUser={deleteUserHandler} key={user.id} />
            );
          })}
      </>
    );

  return <>{Messages.users.permissionDenied()}</>;
};

export default Index;
