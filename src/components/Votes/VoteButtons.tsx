import { useEffect, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { ThumbUp, ThumbDown } from "@material-ui/icons";

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

const VoteButtons = ({ motionId, votes, setVotes }: Props) => {
  const currentUser = useCurrentUser();
  const motionFromGlobal = useReactiveVar(motionVar);
  const [upVotes, setUpVotes] = useState<Vote[]>([]);
  const [downVotes, setDownVotes] = useState<Vote[]>([]);
  const [createVote] = useMutation(CREATE_VOTE);
  const [deleteVote] = useMutation(DELETE_VOTE);

  useEffect(() => {
    setUpVotes(votes.filter((vote) => vote.flipState === Votes.FlipStates.Up));
    setDownVotes(
      votes.filter((vote) => vote.flipState === Votes.FlipStates.Down)
    );
  }, [votes]);

  const alreadyVote = (): Vote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const alreadyUpVote = (): Vote | null => {
    if (alreadyVote()?.flipState === Votes.FlipStates.Up) return alreadyVote();
    return null;
  };

  const alreadyDownVote = (): Vote | null => {
    if (alreadyVote()?.flipState === Votes.FlipStates.Down)
      return alreadyVote();
    return null;
  };

  const buttonColor = (flipState: string): string => {
    if (
      (flipState === Votes.FlipStates.Up && alreadyUpVote()) ||
      (flipState === Votes.FlipStates.Down && alreadyDownVote())
    )
      return "tomato";
    return "white";
  };

  const handleButtonClick = async (flipState: string) => {
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
      (alreadyVote() && alreadyVote()?.flipState !== flipState) ||
      !alreadyVote()
    ) {
      const { data } = await createVote({
        variables: {
          userId: currentUser?.id,
          motionId,
          flipState,
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
    flipState,
  }: {
    votes: Vote[];
    flipState: string;
  }) => {
    const Icon = (props: any) =>
      flipState === Votes.FlipStates.Up ? (
        <ThumbUp {...props} />
      ) : (
        <ThumbDown {...props} />
      );
    return (
      <IconButton onClick={() => handleButtonClick(flipState)}>
        <Icon
          style={{
            color: buttonColor(flipState),
          }}
        />
        {votes.length > 0 && (
          <span
            style={{ color: buttonColor(flipState) }}
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
      <VoteButton votes={upVotes} flipState={Votes.FlipStates.Up} />
      <VoteButton votes={downVotes} flipState={Votes.FlipStates.Down} />
    </>
  );
};

export default VoteButtons;
