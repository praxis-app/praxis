import { useState, useEffect } from "react";
import { ConsensusStates, FlipStates } from "../constants/vote";

export const useConsensusVotes = (
  votes: ClientVote[],
  callDep?: any
): [ClientVote[], ClientVote[], ClientVote[], ClientVote[]] => {
  const [agreements, setAgreements] = useState<ClientVote[]>([]);
  const [standAsides, setStandAsides] = useState<ClientVote[]>([]);
  const [reservations, setReservations] = useState<ClientVote[]>([]);
  const [blocks, setBlocks] = useState<ClientVote[]>([]);

  useEffect(() => {
    setAgreements(consensusFilter(ConsensusStates.Agreement));
    setStandAsides(consensusFilter(ConsensusStates.StandAside));
    setReservations(consensusFilter(ConsensusStates.Reservations));
    setBlocks(consensusFilter(ConsensusStates.Block));
  }, [votes, JSON.stringify(callDep)]);

  const consensusFilter = (voteState: string): ClientVote[] =>
    votes.filter(({ consensusState }) => consensusState === voteState);

  return [agreements, standAsides, reservations, blocks];
};

export const useUpDownVotes = (
  votes: ClientVote[],
  callDep?: any
): [ClientVote[], ClientVote[]] => {
  const [upVotes, setUpVotes] = useState<ClientVote[]>([]);
  const [downVotes, setDownVotes] = useState<ClientVote[]>([]);

  useEffect(() => {
    setUpVotes(upDownFilter(FlipStates.Up));
    setDownVotes(upDownFilter(FlipStates.Down));
  }, [votes, JSON.stringify(callDep)]);

  const upDownFilter = (voteState: string): ClientVote[] =>
    votes.filter(({ flipState }) => flipState === voteState);

  return [upVotes, downVotes];
};
