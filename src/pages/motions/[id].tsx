import React, { useState, useEffect } from "react";
import { useMutation, useLazyQuery, useReactiveVar } from "@apollo/client";
import { Card, CircularProgress, Tab, Tabs } from "@material-ui/core";
import Router, { useRouter } from "next/router";

import {
  MOTION,
  COMMENTS_BY_MOTION_ID,
  VOTES_BY_MOTION_ID,
} from "../../apollo/client/queries";
import { DELETE_MOTION, DELETE_COMMENT } from "../../apollo/client/mutations";
import { motionVar, votesVar } from "../../apollo/client/localState";
import Motion from "../../components/Motions/Motion";
import CommentsForm from "../../components/Comments/Form";
import CommentsList from "../../components/Comments/List";
import VotesList from "../../components/Votes/List";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import { useCurrentUser } from "../../hooks";

const Show = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const votes = useReactiveVar(votesVar);
  const motion = useReactiveVar(motionVar);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tab, setTab] = useState<number>(0);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [getMotionRes, motionRes] = useLazyQuery(MOTION, noCache);
  const [getVotesRes, votesRes] = useLazyQuery(VOTES_BY_MOTION_ID, noCache);
  const [getCommentsRes, commentsRes] = useLazyQuery(
    COMMENTS_BY_MOTION_ID,
    noCache
  );

  useEffect(() => {
    if (query.id) {
      getMotionRes({
        variables: { id: query.id },
      });
      getVotesRes({
        variables: { motionId: query.id },
      });
    }
  }, [query.id]);

  useEffect(() => {
    if (motion) getCommentsRes({ variables: { motionId: motion.id } });
  }, [motion]);

  useEffect(() => {
    if (motionRes.data) motionVar(motionRes.data.motion);
    return () => {
      motionVar(null);
    };
  }, [motionRes.data]);

  useEffect(() => {
    if (votesRes.data) votesVar(votesRes.data.votesByMotionId);
    return () => {
      votesVar([]);
    };
  }, [votesRes.data]);

  useEffect(() => {
    if (commentsRes.data) setComments(commentsRes.data.commentsByMotionId);
  }, [commentsRes.data]);

  useEffect(() => {
    if (!votes.find((vote) => vote.body)) setTab(1);
    else setTab(0);
  }, [votes]);

  const deleteMotionHandler = async (id: string) => {
    await deleteMotion({
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

  if (motion)
    return (
      <>
        <Motion motion={motion} deleteMotion={deleteMotionHandler} />

        <Card>
          <Tabs
            textColor="inherit"
            centered
            value={tab}
            onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
              setTab(newValue)
            }
          >
            <Tab label={Messages.motions.tabs.votes()} />
            <Tab label={Messages.motions.tabs.comments()} />
          </Tabs>
        </Card>

        {tab === 0 && <VotesList votes={votes} setVotes={votesVar} />}

        {tab === 1 && (
          <>
            {currentUser && (
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
        )}
      </>
    );

  return <CircularProgress />;
};

export default Show;
