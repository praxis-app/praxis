import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";

import VotesForm from "../../../components/Votes/Form";
import { VOTE } from "../../../apollo/client/queries";

const Edit = () => {
  const { query } = useRouter();
  const [vote, setVote] = useState<Vote>();
  const [getVotesRes, votesRes] = useLazyQuery(VOTE);

  useEffect(() => {
    if (query.id)
      getVotesRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    if (votesRes.data) setVote(votesRes.data.vote);
  }, [votesRes.data]);

  if (vote) return <VotesForm vote={vote} />;
  return <CircularProgress style={{ color: "white" }} />;
};

export default Edit;
