import { useEffect, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { ThumbUp, ThumbDown, PanTool, ThumbsUpDown } from "@material-ui/icons";

import { Motions, Votes } from "../../constants";
import { motionVar } from "../../apollo/client/localState";
import { CREATE_VOTE, DELETE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/VoteButtons.module.scss";
import { useCurrentUser } from "../../hooks";

interface Props {
  motionId?: string;
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
}

const ConsensusButtons = ({ motionId, votes, setVotes }: Props) => {
  const currentUser = useCurrentUser();
  const motionFromGlobal = useReactiveVar(motionVar);
  const [agreements, setAgreements] = useState<Vote[]>([]);
  const [reservations, setReservations] = useState<Vote[]>([]);
  const [standAsides, setStandAsides] = useState<Vote[]>([]);
  const [blocks, setBlocks] = useState<Vote[]>([]);
  const [createVote] = useMutation(CREATE_VOTE);
  const [deleteVote] = useMutation(DELETE_VOTE);

  useEffect(() => {
    setAgreements(
      votes.filter(
        (vote) => vote.consensusState === Votes.ConsensusStates.Agreement
      )
    );
    setReservations(
      votes.filter(
        (vote) => vote.consensusState === Votes.ConsensusStates.Reservations
      )
    );
    setStandAsides(
      votes.filter(
        (vote) => vote.consensusState === Votes.ConsensusStates.StandAside
      )
    );
    setBlocks(
      votes.filter(
        (vote) => vote.consensusState === Votes.ConsensusStates.Block
      )
    );
  }, [votes]);

  const alreadyVote = (): Vote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const alreadyAgree = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.Agreement)
      return alreadyVote();
    return null;
  };

  const alreadyDeclaredReservations = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.Reservations)
      return alreadyVote();
    return null;
  };

  const alreadyDelcaredStandAside = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.StandAside)
      return alreadyVote();
    return null;
  };

  const alreadyBlocked = (): Vote | null => {
    if (alreadyVote()?.consensusState === Votes.ConsensusStates.Block)
      return alreadyVote();
    return null;
  };

  const buttonColor = (flipState: string): string => {
    if (
      (flipState === Votes.ConsensusStates.Agreement && alreadyAgree()) ||
      (flipState === Votes.ConsensusStates.Reservations &&
        alreadyDeclaredReservations()) ||
      (flipState === Votes.ConsensusStates.StandAside &&
        alreadyDelcaredStandAside()) ||
      (flipState === Votes.ConsensusStates.Block && alreadyBlocked())
    )
      return "tomato";
    return "white";
  };

  const handleButtonClick = async (consensusState: string) => {
    let newVotes: Vote[] = votes;
    if (alreadyVote()) {
      await deleteVote({
        variables: {
          id: alreadyVote()?.id,
        },
      });
      newVotes = newVotes.filter((vote) => vote.userId !== currentUser?.id);
    }
    if (
      (alreadyVote() && alreadyVote()?.consensusState !== consensusState) ||
      !alreadyVote()
    ) {
      const { data } = await createVote({
        variables: {
          userId: currentUser?.id,
          motionId,
          consensusState,
        },
      });
      newVotes = [...newVotes, data.createVote.vote];
      if (data.createVote.motionRatified && motionFromGlobal) {
        motionVar({ ...motionFromGlobal, stage: Motions.Stages.Ratified });
      }
    }
    setVotes(newVotes);
  };

  const VoteButton = ({
    votes,
    consensusState,
  }: {
    votes: Vote[];
    consensusState: string;
  }) => {
    const Icon = (props: any) => {
      if (consensusState === Votes.ConsensusStates.Agreement)
        return <ThumbUp {...props} />;
      if (consensusState === Votes.ConsensusStates.Reservations)
        return <ThumbsUpDown {...props} />;
      if (consensusState === Votes.ConsensusStates.StandAside)
        return <ThumbDown {...props} />;
      return <PanTool {...props} />;
    };
    return (
      <IconButton onClick={() => handleButtonClick(consensusState)}>
        <Icon
          style={{
            color: buttonColor(consensusState),
          }}
        />
        {votes.length > 0 && (
          <span
            style={{ color: buttonColor(consensusState) }}
            className={styles.votesNumber}
          >
            {votes.length}
          </span>
        )}
      </IconButton>
    );
  };

  return (
    <>
      <VoteButton
        votes={agreements}
        consensusState={Votes.ConsensusStates.Agreement}
      />
      <VoteButton
        votes={standAsides}
        consensusState={Votes.ConsensusStates.StandAside}
      />
      <VoteButton votes={blocks} consensusState={Votes.ConsensusStates.Block} />
      <VoteButton
        votes={reservations}
        consensusState={Votes.ConsensusStates.Reservations}
      />
    </>
  );
};

export default ConsensusButtons;
