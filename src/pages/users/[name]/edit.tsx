import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";

import UserForm from "../../../components/Users/Form";
import { USER_BY_NAME } from "../../../apollo/client/queries";
import { useCurrentUser } from "../../../hooks";
import { breadcrumbsVar } from "../../../apollo/client/localState";
import { ResourcePaths } from "../../../constants/common";
import { noCache } from "../../../utils/clientIndex";
import Messages from "../../../utils/messages";

const Edit = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [user, setUser] = useState<ClientUser>();
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME, noCache);

  useEffect(() => {
    if (query.name) {
      getUserRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.userByName);
  }, [userRes.data]);

  useEffect(() => {
    if (user)
      breadcrumbsVar([
        {
          label: user.name,
          href: `${ResourcePaths.User}${user.name}`,
        },
        {
          label: Messages.users.actions.editProfile(),
        },
      ]);
    else breadcrumbsVar([]);

    return () => {
      breadcrumbsVar([]);
    };
  }, [user]);

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (userRes.loading) return <CircularProgress />;
  if (!ownUser()) return <>{Messages.users.permissionDenied()}</>;

  return <UserForm user={user} isEditing={true} />;
};

export default Edit;
