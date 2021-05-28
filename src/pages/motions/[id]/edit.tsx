import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import MotionsForm from "../../../components/Motions/Form";
import { MOTION, USER, CURRENT_USER } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";

const Edit = () => {
  const { query } = useRouter();
  const [motion, setMotions] = useState<Motion>();
  const [user, setUser] = useState<User>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [getMotionRes, motionRes] = useLazyQuery(MOTION);
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);
  const currentUserRes = useQuery(CURRENT_USER);

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
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

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
  if (motion) return <MotionsForm motion={motion} isEditing={true} />;
  return <CircularProgress style={{ color: "white" }} />;
};

export default Edit;
