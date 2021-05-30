import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import Router from "next/router";

import User from "../../components/Users/User";
import { USERS } from "../../apollo/client/queries";
import { DELETE_USER, LOGOUT_USER } from "../../apollo/client/mutations";
import { Common } from "../../constants";
import { useCurrentUser } from "../../hooks";

const Index = () => {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[]>();
  const { data } = useQuery(USERS, {
    fetchPolicy: "no-cache",
  });
  const [deleteUser] = useMutation(DELETE_USER);
  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    if (data) setUsers(data.allUsers);
  }, [data]);

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

  return (
    <>
      {users ? (
        users
          .slice()
          .reverse()
          .slice(0, Common.PAGE_SIZE)
          .map((user: User) => {
            return (
              <User user={user} deleteUser={deleteUserHandler} key={user.id} />
            );
          })
      ) : (
        <CircularProgress style={{ color: "white" }} />
      )}
    </>
  );
};

export default Index;
