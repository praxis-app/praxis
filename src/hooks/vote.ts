import { useState, useEffect } from "react";
import { ConsensusStates, FlipStates } from "../constants/vote";

export const useConsensusVotes = (
  votes: Vote[],
  callDep?: any
): [Vote[], Vote[], Vote[], Vote[]] => {
  const [agreements, setAgreements] = useState<Vote[]>([]);
  const [standAsides, setStandAsides] = useState<Vote[]>([]);
  const [reservations, setReservations] = useState<Vote[]>([]);
  const [blocks, setBlocks] = useState<Vote[]>([]);

  useEffect(() => {
    setAgreements(consensusFilter(ConsensusStates.Agreement));
    setStandAsides(consensusFilter(ConsensusStates.StandAside));
    setReservations(consensusFilter(ConsensusStates.Reservations));
    setBlocks(consensusFilter(ConsensusStates.Block));
  }, [votes, JSON.stringify(callDep)]);

  const consensusFilter = (voteState: string): Vote[] =>
    votes.filter(({ consensusState }) => consensusState === voteState);

  return [agreements, standAsides, reservations, blocks];
};

export const useUpDownVotes = (
  votes: Vote[],
  callDep?: any
): [Vote[], Vote[]] => {
  const [upVotes, setUpVotes] = useState<Vote[]>([]);
  const [downVotes, setDownVotes] = useState<Vote[]>([]);

  useEffect(() => {
    setUpVotes(upDownFilter(FlipStates.Up));
    setDownVotes(upDownFilter(FlipStates.Down));
  }, [votes, JSON.stringify(callDep)]);

  const upDownFilter = (voteState: string): Vote[] =>
    votes.filter(({ flipState }) => flipState === voteState);

  return [upVotes, downVotes];
};
