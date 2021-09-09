import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { Card, CardContent, CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";

import VotesForm from "../../../components/Votes/Form";
import { VOTE, MOTION } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import { useSettingsByGroupId } from "../../../hooks";
import { GroupSettings } from "../../../constants/setting";
import { VotingTypes } from "../../../constants/vote";

const Edit = () => {
  const { query } = useRouter();
  const [vote, setVote] = useState<ClientVote>();
  const [motion, setMotion] = useState<ClientMotion>();
  const [groupSettings] = useSettingsByGroupId(motion?.groupId);
  const [isModelOfConsensus, setIsModelOfConsensus] = useState<boolean>(false);
  const [getVotesRes, votesRes] = useLazyQuery(VOTE, noCache);
  const [getMotionRes, motionRes] = useLazyQuery(MOTION, noCache);

  useEffect(() => {
    setIsModelOfConsensus(
      settingByName(GroupSettings.VotingType) === VotingTypes.Consensus
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

  if (!vote) return <CircularProgress />;

  return (
    <Card>
      <CardContent>
        <VotesForm
          vote={vote}
          onEditPage={true}
          modelOfConsensus={isModelOfConsensus}
        />
      </CardContent>
    </Card>
  );
};

export default Edit;
