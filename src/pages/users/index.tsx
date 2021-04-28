import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";

import User from "../../components/Users/User";
import { USERS } from "../../apollo/client/queries";
import { DELETE_USER } from "../../apollo/client/mutations";
import { Common } from "../../constants";

const Index = () => {
  const [users, setUsers] = useState<User[]>();
  const [deleteUser] = useMutation(DELETE_USER);
  const { data } = useQuery(USERS, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (data) setUsers(data.allUsers);
  }, [data]);

  const deleteUserHandler = async (userId: string) => {
    try {
      await deleteUser({
        variables: {
          id: userId,
        },
      });
      // Removes deleted user from state
      if (users) setUsers(users.filter((user: User) => user.id !== userId));
    } catch {}
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
