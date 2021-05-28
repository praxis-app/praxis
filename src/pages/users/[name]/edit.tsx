import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";

import UserForm from "../../../components/Users/Form";
import { USER_BY_NAME, CURRENT_USER } from "../../../apollo/client/queries";
import Messages from "../../../utils/messages";

const Edit = () => {
  const { query } = useRouter();
  const [user, setUser] = useState<User>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME);
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (query.name) {
      getUserRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    setUser(userRes.data ? userRes.data.userByName : userRes.data);
  }, [userRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (!ownUser()) return <>{Messages.users.permissionDenied()}</>;
  if (user) return <UserForm user={user} isEditing={true} />;
  return <CircularProgress style={{ color: "white" }} />;
};

export default Edit;
