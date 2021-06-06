import { useEffect } from "react";
import Router from "next/router";

import UserForm from "../../components/Users/Form";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";

const SignUp = () => {
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (currentUser?.isAuthenticated) Router.push("/");
  }, [currentUser]);

  if (currentUser) return <>{Messages.users.alreadyRegistered()}</>;
  return <UserForm />;
};

export default SignUp;
