import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";

import VotesForm from "../../../components/Votes/Form";
import { VOTE, MOTION } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import { useSettingsByGroupId } from "../../../hooks";
import { Settings, Votes } from "../../../constants";

const Edit = () => {
  const { query } = useRouter();
  const [vote, setVote] = useState<Vote>();
  const [motion, setMotion] = useState<Motion>();
  const [groupSettings] = useSettingsByGroupId(motion?.groupId);
  const [isModelOfConsensus, setIsModelOfConsensus] = useState<boolean>(false);
  const [getVotesRes, votesRes] = useLazyQuery(VOTE, noCache);
  const [getMotionRes, motionRes] = useLazyQuery(MOTION, noCache);

  useEffect(() => {
    setIsModelOfConsensus(
      settingByName(Settings.GroupSettings.VotingType) ===
        Votes.VotingTypes.Consensus
    );
  }, [groupSettings]);

  useEffect(() => {
    if (query.id)
      getVotesRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    if (vote)
      getMotionRes({
        variables: { id: vote.motionId },
      });
  }, [vote]);

  useEffect(() => {
    if (votesRes.data) setVote(votesRes.data.vote);
  }, [votesRes.data]);

  useEffect(() => {
    if (motionRes.data) setMotion(motionRes.data.motion);
  }, [motionRes.data]);

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  if (vote)
    return (
      <VotesForm
        vote={vote}
        onEditPage={true}
        modelOfConsensus={isModelOfConsensus}
      />
    );
  return <CircularProgress style={{ color: "white" }} />;
};

export default Edit;
