import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { Spinner } from "react-bootstrap";
import Router, { useRouter } from "next/router";

import { POST, COMMENTS_BY_POST_ID } from "../../apollo/client/queries";
import { DELETE_POST, DELETE_COMMENT } from "../../apollo/client/mutations";
import Post from "../../components/Posts/Post";
import CommentsForm from "../../components/Comments/Form";
import CommentsList from "../../components/Comments/List";

const Show = () => {
  const { query } = useRouter();
  const [post, setPost] = useState<Post>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [deletePost] = useMutation(DELETE_POST);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const [getPostRes, postRes] = useLazyQuery(POST);
  const [getCommentsRes, commentsRes] = useLazyQuery(COMMENTS_BY_POST_ID, {
    fetchPolicy: "no-cache",
  });

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
    setPost(postRes.data ? postRes.data.post : null);
  }, [postRes.data]);

  useEffect(() => {
    setComments(commentsRes.data ? commentsRes.data.commentsByPostId : []);
  }, [commentsRes.data]);

  const deletePostHandler = async (id: string) => {
    try {
      await deletePost({
        variables: {
          id,
        },
      });
      Router.push("/");
    } catch {}
  };

  const deleteCommentHandler = async (id: string) => {
    try {
      await deleteComment({
        variables: {
          id,
        },
      });
      setComments(comments.filter((comment: Comment) => comment.id !== id));
    } catch {}
  };

  if (post)
    return (
      <>
        <Post post={post} deletePost={deletePostHandler} />
        <CommentsForm
          postId={post.id}
          comments={comments}
          setComments={setComments}
        />
        <CommentsList
          comments={comments}
          deleteComment={deleteCommentHandler}
        />
      </>
    );
  return <Spinner animation="border" />;
};

export default Show;
