import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import PostForm from "../../../components/Posts/Form";
import { POST, USER } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import { useCurrentUser } from "../../../hooks";

const Edit = () => {
  const { query } = useRouter();
  const [post, setPost] = useState<Post>();
  const [user, setUser] = useState<User>();
  const [getPostRes, postRes] = useLazyQuery(POST);
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (query.id)
      getPostRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    if (post) getUserRes({ variables: { id: post.userId } });
  }, [post]);

  useEffect(() => {
    setPost(postRes.data ? postRes.data.post : postRes.data);
  }, [postRes.data]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (currentUser && user && !ownPost()) {
      Router.push("/");
    }
  }, [currentUser, user]);

  const ownPost = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  if (!ownPost()) return <>{Messages.users.permissionDenied()}</>;
  if (post) return <PostForm post={post} isEditing={true} />;
  return <CircularProgress style={{ color: "white" }} />;
};

export default Edit;
