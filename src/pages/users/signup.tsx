import { useEffect, useState } from "react";
import Router from "next/router";
import { CircularProgress } from "@material-ui/core";

import UserForm from "../../components/Users/Form";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { SERVER_INVITE_BY_TOKEN } from "../../apollo/client/queries";
import { noCache } from "../../utils/apollo";
import { useLazyQuery } from "@apollo/client";
import { redeemedInviteToken } from "../../utils/invite";

const SignUp = () => {
  const token = redeemedInviteToken();
  const currentUser = useCurrentUser();
  const [invite, setInvite] = useState<ServerInvite>();
  const [getInviteRes, inviteRes] = useLazyQuery(
    SERVER_INVITE_BY_TOKEN,
    noCache
  );

  useEffect(() => {
    if (token) {
      getInviteRes({
        variables: { token },
      });
    }
  }, [token]);

  useEffect(() => {
    if (inviteRes.data) {
      setInvite(inviteRes.data.serverInviteByToken);
    }
  }, [inviteRes.data]);

  useEffect(() => {
    if (currentUser?.isAuthenticated) Router.push("/");
  }, [currentUser]);

  if (inviteRes.loading) return <CircularProgress style={{ color: "white" }} />;
  if (currentUser) return <>{Messages.users.alreadyRegistered()}</>;
  if (invite) return <UserForm />;
  return <>{Messages.invites.redeem.inviteRequired()}</>;
};

export default SignUp;
