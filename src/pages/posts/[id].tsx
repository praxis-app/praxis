import React, { useState, useEffect } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import Router, { useRouter } from "next/router";

import { POST, COMMENTS_BY_POST_ID } from "../../apollo/client/queries";
import { DELETE_POST, DELETE_COMMENT } from "../../apollo/client/mutations";
import Post from "../../components/Posts/Post";
import CommentsForm from "../../components/Comments/Form";
import CommentsList from "../../components/Comments/List";
import { noCache } from "../../utils/apollo";
import { useCurrentUser } from "../../hooks";

const Show = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [post, setPost] = useState<Post>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [deletePost] = useMutation(DELETE_POST);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const [getPostRes, postRes] = useLazyQuery(POST);
  const [getCommentsRes, commentsRes] = useLazyQuery(
    COMMENTS_BY_POST_ID,
    noCache
  );

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
        {currentUser && (
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
