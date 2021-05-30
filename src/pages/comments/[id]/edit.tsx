import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import Router, { useRouter } from "next/router";

import CommentForm from "../../../components/Comments/Form";
import { COMMENT, USER } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import { useCurrentUser } from "../../../hooks";

const Edit = () => {
  const { query } = useRouter();
  const [comment, setComment] = useState<Comment>();
  const [user, setUser] = useState<User>();
  const [getCommentsRes, commentsRes] = useLazyQuery(COMMENT);
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (query.id)
      getCommentsRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    if (comment)
      getUserRes({
        variables: {
          id: comment.userId,
        },
      });
  }, [comment]);

  useEffect(() => {
    setComment(commentsRes.data ? commentsRes.data.comment : commentsRes.data);
  }, [commentsRes.data]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (currentUser && user && !ownComment()) {
      Router.push("/");
    }
  }, [currentUser, user]);

  const ownComment = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (!ownComment()) return <>{Messages.users.permissionDenied()}</>;
  if (comment) return <CommentForm comment={comment} isEditing={true} />;
  return <CircularProgress style={{ color: "white" }} />;
};

export default Edit;
