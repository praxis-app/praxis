import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import Router, { useRouter } from "next/router";

import { isLoggedIn } from "../../utils/auth";
import {
  MOTION,
  COMMENTS_BY_MOTION_ID,
  CURRENT_USER,
} from "../../apollo/client/queries";
import { DELETE_MOTION, DELETE_COMMENT } from "../../apollo/client/mutations";
import Motion from "../../components/Motions/Motion";
import CommentsForm from "../../components/Comments/Form";
import CommentsList from "../../components/Comments/List";

const Show = () => {
  const { query } = useRouter();
  const [motion, setMotion] = useState<Motion>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const [getMotionRes, motionRes] = useLazyQuery(MOTION);
  const [getCommentsRes, commentsRes] = useLazyQuery(COMMENTS_BY_MOTION_ID, {
    fetchPolicy: "no-cache",
  });
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (query.id)
      getMotionRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    if (motion) getCommentsRes({ variables: { motionId: motion.id } });
  }, [motion]);

  useEffect(() => {
    if (motionRes.data) setMotion(motionRes.data.motion);
  }, [motionRes.data]);

  useEffect(() => {
    if (commentsRes.data) setComments(commentsRes.data.commentsByMotionId);
  }, [commentsRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const deleteMotionHandler = async (id: string) => {
    try {
      await deleteMotion({
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

  if (motion)
    return (
      <>
        <Motion motion={motion} deleteMotion={deleteMotionHandler} />
        {isLoggedIn(currentUser) && (
          <CommentsForm
            motionId={motion.id}
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
