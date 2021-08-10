import { useState } from "react";
import { Typography } from "@material-ui/core";
import { ThumbsUpDown, ThumbUp, ThumbDown, PanTool } from "@material-ui/icons";
import _ from "lodash";

import styles from "../../styles/Vote/Chips.module.scss";
import Chip, { ChipProps } from "./Chip";
import {
  ConsensusStates,
  FlipStates,
  useConsensusVotes,
  useUpDownVotes,
} from "../../hooks";
import VotesModal from "./Modal";

interface VoteChipsProps {
  votes: Vote[];
}

const VoteChips = ({ votes }: VoteChipsProps) => {
  const [agreements, standAsides, reservations, blocks] =
    useConsensusVotes(votes);
  const [upVotes, downVotes] = useUpDownVotes(votes);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const agreementsChip: ChipProps = {
    voteState: ConsensusStates.Agreement,
    votes: agreements,
    icon: ThumbUp,
    zIndex: 4,
    marginLeft: 5,
  };

  const standAsidesChip: ChipProps = {
    voteState: ConsensusStates.StandAside,
    votes: standAsides,
    icon: ThumbDown,
    zIndex: 3,
    marginLeft: 4,
  };

  const reservationsChip: ChipProps = {
    voteState: ConsensusStates.Reservations,
    votes: reservations,
    icon: ThumbsUpDown,
    zIndex: 2,
    marginLeft: 5,
  };

  const blocksChip: ChipProps = {
    voteState: ConsensusStates.Block,
    votes: blocks,
    icon: PanTool,
    zIndex: 1,
    marginLeft: 4,
  };

  const upVotesChip: ChipProps = {
    voteState: FlipStates.Up,
    votes: upVotes,
    icon: ThumbUp,
    zIndex: 2,
    marginLeft: 5,
  };

  const downVotesChip: ChipProps = {
    voteState: FlipStates.Down,
    votes: downVotes,
    icon: ThumbDown,
    zIndex: 1,
    marginLeft: 4,
  };

  const consensusChips = [
    agreementsChip,
    standAsidesChip,
    reservationsChip,
    blocksChip,
  ].sort((a, b) => b.votes.length - a.votes.length);

  const upDownChips = [upVotesChip, downVotesChip].sort(
    (a, b) => b.votes.length - a.votes.length
  );

  const zIndex = (chip: ChipProps, chips: ChipProps[]): number => {
    return _.findIndex(
      chips.slice().reverse(),
      (_chip) => _chip.zIndex === chip.zIndex
    );
  };

  if (!votes.length) return <div></div>;

  return (
    <>
      <Typography
        onClick={() => setModalOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <span className={styles.chipsContainer}>
          {consensusChips.map((chip, index) => {
            if (chip.votes.length)
              return (
                <Chip
                  {...chip}
                  zIndex={zIndex(chip, consensusChips)}
                  key={index}
                />
              );
          })}

          {upDownChips.map((chip, index) => {
            if (chip.votes.length)
              return (
                <Chip
                  {...chip}
                  zIndex={zIndex(chip, upDownChips)}
                  key={index}
                />
              );
          })}
        </span>

        {votes.length}
      </Typography>

      <VotesModal votes={votes} open={modalOpen} setOpen={setModalOpen} />
    </>
  );
};

export default VoteChips;
