import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import Router, { useRouter } from "next/router";

import { isLoggedIn } from "../../utils/auth";
import {
  POST,
  COMMENTS_BY_POST_ID,
  CURRENT_USER,
} from "../../apollo/client/queries";
import { DELETE_POST, DELETE_COMMENT } from "../../apollo/client/mutations";
import Post from "../../components/Posts/Post";
import CommentsForm from "../../components/Comments/Form";
import CommentsList from "../../components/Comments/List";
import { noCache } from "../../utils/apollo";

const Show = () => {
  const { query } = useRouter();
  const [post, setPost] = useState<Post>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [deletePost] = useMutation(DELETE_POST);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const [getPostRes, postRes] = useLazyQuery(POST);
  const [getCommentsRes, commentsRes] = useLazyQuery(
    COMMENTS_BY_POST_ID,
    noCache
  );
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (query.id)
      getPostRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    if (post) getCommentsRes({ variables: { postId: post.id } });
  }, [post]);

  useEffect(() => {
    if (postRes.data) setPost(postRes.data.post);
  }, [postRes.data]);

  useEffect(() => {
    if (commentsRes.data) setComments(commentsRes.data.commentsByPostId);
  }, [commentsRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const deletePostHandler = async (id: string) => {
    await deletePost({
      variables: {
        id,
      },
    });
    Router.push("/");
  };

  const deleteCommentHandler = async (id: string) => {
    await deleteComment({
      variables: {
        id,
      },
    });
    setComments(comments.filter((comment: Comment) => comment.id !== id));
  };

  if (post)
    return (
      <>
        <Post post={post} deletePost={deletePostHandler} />
        {isLoggedIn(currentUser) && (
          <CommentsForm
            postId={post.id}
            comments={comments}
            setComments={setComments}
          />
        )}
        <CommentsList
          comments={comments}
          deleteComment={deleteCommentHandler}
        />
      </>
    );

  return <CircularProgress style={{ color: "white" }} />;
};

export default Show;
