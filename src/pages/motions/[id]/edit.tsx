import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import {
  MOTION,
  USER,
  VOTES_BY_MOTION_ID,
} from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import { useCurrentUser } from "../../../hooks";
import MotionsFormWithCard from "../../../components/Motions/FormWithCard";
import { NavigationPaths } from "../../../constants/common";

const Edit = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [motion, setMotions] = useState<ClientMotion>();
  const [votes, setVotes] = useState<ClientVote[]>([]);
  const [user, setUser] = useState<ClientUser>();
  const [getMotionRes, motionRes] = useLazyQuery(MOTION);
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);
  const [getVotesRes, votesRes] = useLazyQuery(VOTES_BY_MOTION_ID, noCache);

  useEffect(() => {
    if (query.id) {
      getMotionRes({
        variables: { id: query.id },
      });
      getVotesRes({
        variables: { motionId: query.id },
      });
    }
  }, [query.id]);

  useEffect(() => {
    if (motion)
      getUserRes({
        variables: {
          id: motion.userId,
        },
      });
  }, [motion]);

  useEffect(() => {
    setMotions(motionRes.data ? motionRes.data.motion : motionRes.data);
  }, [motionRes.data]);

  useEffect(() => {
    if (votesRes.data) setVotes(votesRes.data.votesByMotionId);
  }, [votesRes.data]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (currentUser && user && !ownMotion()) {
      Router.push(NavigationPaths.Home);
    }
  }, [currentUser, user]);

  const ownMotion = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (motionRes.loading || userRes.loading || votesRes.loading)
    return <CircularProgress />;
  if (!ownMotion()) return <>{Messages.users.permissionDenied()}</>;
  if (votes.length) return <>{Messages.motions.prompts.noEditAfterVoting()}</>;

  return <MotionsFormWithCard motion={motion} isEditing={true} withoutToggle />;
};

export default Edit;
