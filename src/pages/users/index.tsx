import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress, Typography } from "@material-ui/core";
import Router from "next/router";

import User from "../../components/Users/User";
import { USERS } from "../../apollo/client/queries";
import { DELETE_USER, LOGOUT_USER } from "../../apollo/client/mutations";
import { Common, Roles } from "../../constants";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";

const Index = () => {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const usersRes = useQuery(USERS, noCache);
  const [deleteUser] = useMutation(DELETE_USER);
  const [logoutUser] = useMutation(LOGOUT_USER);
  const [canManageUsers, canManageUsersLoading] = useHasPermissionGlobally(
    Roles.Permissions.ManageUsers
  );

  useEffect(() => {
    if (usersRes.data) setUsers(usersRes.data.allUsers);
  }, [usersRes.data]);

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

  if (canManageUsersLoading || usersRes.data.loading)
    return <CircularProgress style={{ color: "white" }} />;

  if (canManageUsers)
    return (
      <>
        <Typography variant="h4" style={{ marginBottom: 24 }}>
          {Messages.navigation.users()}
        </Typography>

        {users
          .slice()
          .reverse()
          .slice(0, Common.PAGE_SIZE)
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
