import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { Card, CardContent, CircularProgress } from "@material-ui/core";
import Router, { useRouter } from "next/router";

import CommentForm from "../../../components/Comments/Form";
import { COMMENT, USER } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import { useCurrentUser } from "../../../hooks";
import { NavigationPaths } from "../../../constants/common";

const Edit = () => {
  const { query } = useRouter();
  const [comment, setComment] = useState<ClientComment>();
  const [user, setUser] = useState<ClientUser>();
  const [getCommentRes, commentRes] = useLazyQuery(COMMENT);
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (query.id)
      getCommentRes({
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
    setComment(commentRes.data ? commentRes.data.comment : commentRes.data);
  }, [commentRes.data]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (currentUser && user && !ownComment()) {
      Router.push(NavigationPaths.Home);
    }
  }, [currentUser, user]);

  const ownComment = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (!ownComment()) return <>{Messages.users.permissionDenied()}</>;
  if (comment)
    return (
      <Card>
        <CardContent style={{ marginTop: 12 }}>
          <CommentForm comment={comment} isEditing={true} />
        </CardContent>
      </Card>
    );
  return <CircularProgress />;
};

export default Edit;
