import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Router from "next/router";

import { CURRENT_USER } from "../../apollo/client/queries";
import UserForm from "../../components/Users/Form";
import Messages from "../../utils/messages";
import { isLoggedIn } from "../../utils/auth";

const SignUp = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (currentUser?.isAuthenticated) Router.push("/");
  }, [currentUser]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  if (isLoggedIn(currentUser)) return <>{Messages.users.alreadyRegistered()}</>;
  return <UserForm />;
};

export default SignUp;
