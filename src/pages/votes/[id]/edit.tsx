import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { useRouter } from "next/router";

import VotesForm from "../../../components/Votes/Form";
import { VOTE, MOTION } from "../../../apollo/client/queries";
import { noCache } from "../../../utils/apollo";
import { useSettingsByGroupId } from "../../../hooks";
import { GroupSettings } from "../../../constants/setting";
import { VotingTypes } from "../../../constants/vote";
import { settingValueByName } from "../../../utils/setting";
import Messages from "../../../utils/messages";
import { TypeNames } from "../../../constants/common";

const Edit = () => {
  const { query } = useRouter();
  const [vote, setVote] = useState<ClientVote>();
  const [motion, setMotion] = useState<ClientMotion>();
  const [groupSettings, _, groupSettingsLoading] = useSettingsByGroupId(
    motion?.groupId
  );
  const [isModelOfConsensus, setIsModelOfConsensus] = useState<boolean>(false);
  const [getVoteRes, voteRes] = useLazyQuery(VOTE, noCache);
  const [getMotionRes, motionRes] = useLazyQuery(MOTION, noCache);

  useEffect(() => {
    setIsModelOfConsensus(
      settingValueByName(GroupSettings.VotingType, groupSettings) ===
        VotingTypes.Consensus
    );
  }, [groupSettings]);

  useEffect(() => {
    if (query.id)
      getVoteRes({
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
    if (voteRes.data) setVote(voteRes.data.vote);
  }, [voteRes.data]);

  useEffect(() => {
    if (motionRes.data) setMotion(motionRes.data.motion);
  }, [motionRes.data]);

  if (voteRes.loading || motionRes.loading || groupSettingsLoading)
    return <CircularProgress />;

  if (!vote)
    return <Typography>{Messages.items.notFound(TypeNames.Vote)}</Typography>;

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
