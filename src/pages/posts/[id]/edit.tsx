import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import PostForm from "../../../components/Posts/Form";
import { POST, USER, CURRENT_USER } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";

const Edit = () => {
  const { query } = useRouter();
  const [post, setPost] = useState<Post>();
  const [user, setUser] = useState<User>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [getPostRes, postRes] = useLazyQuery(POST);
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);
  const currentUserRes = useQuery(CURRENT_USER);

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
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

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
