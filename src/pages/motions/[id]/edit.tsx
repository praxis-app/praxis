import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import { MOTION, USER } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import { useCurrentUser } from "../../../hooks";
import MotionsFormWithCard from "../../../components/Motions/FormWithCard";

const Edit = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [motion, setMotions] = useState<Motion>();
  const [user, setUser] = useState<User>();
  const [getMotionRes, motionRes] = useLazyQuery(MOTION);
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);

  useEffect(() => {
    if (query.id)
      getMotionRes({
        variables: { id: query.id },
      });
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
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (currentUser && user && !ownMotion()) {
      Router.push("/");
    }
  }, [currentUser, user]);

  const ownMotion = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (!ownMotion()) return <>{Messages.users.permissionDenied()}</>;
  if (motion) return <MotionsFormWithCard motion={motion} isEditing={true} />;
  return <CircularProgress />;
};

export default Edit;
