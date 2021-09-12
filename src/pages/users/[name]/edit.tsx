import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";

import UserForm from "../../../components/Users/Form";
import { USER_BY_NAME } from "../../../apollo/client/queries";
import Messages from "../../../utils/messages";
import { useCurrentUser } from "../../../hooks";

const Edit = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [user, setUser] = useState<ClientUser>();
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME);

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

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (!ownUser()) return <>{Messages.users.permissionDenied()}</>;
  if (user) return <UserForm user={user} isEditing={true} />;
  return <CircularProgress />;
};

export default Edit;
