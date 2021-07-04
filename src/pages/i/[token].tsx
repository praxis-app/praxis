import { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";

import { SERVER_INVITE_BY_TOKEN } from "../../apollo/client/queries";
import { REDEEM_SERVER_INVITE } from "../../apollo/client/mutations";
import { noCache } from "../../utils/apollo";
import { useCurrentUser } from "../../hooks";
import WelcomeCard from "../../components/About/Welcome";
import Messages from "../../utils/messages";
import { Common } from "../../constants";
import { redeemedInviteToken } from "../../utils/invite";

const RedeemServerInvite = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [invite, setInvite] = useState<ServerInvite>();
  const [getInviteRes, inviteRes] = useLazyQuery(
    SERVER_INVITE_BY_TOKEN,
    noCache
  );
  const [redeemServerInvite] = useMutation(REDEEM_SERVER_INVITE);

  useEffect(() => {
    if (query.token) {
      getInviteRes({
        variables: { token: query.token },
      });
    }
  }, [query.token]);

  useEffect(() => {
    if (inviteRes.data && query.token && !redeemedInviteToken()) {
      const token = query.token as string;
      setInvite(inviteRes.data.serverInviteByToken);
      localStorage.setItem(Common.LocalStorage.RedeemedInviteToken, token);
      callRedeemServerInvite(token);
    }
  }, [inviteRes.data, query.token, redeemedInviteToken()]);

  const callRedeemServerInvite = async (token: string) => {
    await redeemServerInvite({
      variables: {
        token,
      },
    });
  };

  if (inviteRes.loading) return <CircularProgress style={{ color: "white" }} />;
  if (currentUser) return <>{Messages.invites.redeem.alreadySignedUp()}</>;
  if (invite) return <WelcomeCard />;
  return <>{Messages.invites.redeem.expiredOrInvalid()}</>;
};

export default RedeemServerInvite;
