import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import Router from "next/router";

import User from "../../components/Users/User";
import { USERS, CURRENT_USER } from "../../apollo/client/queries";
import { DELETE_USER, LOGOUT_USER } from "../../apollo/client/mutations";
import { Common } from "../../constants";

const Index = () => {
  const [users, setUsers] = useState<User[]>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const { data } = useQuery(USERS, {
    fetchPolicy: "no-cache",
  });
  const currentUserRes = useQuery(CURRENT_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    if (data) setUsers(data.allUsers);
  }, [data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

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
