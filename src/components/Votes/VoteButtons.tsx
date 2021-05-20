import { useEffect, useState } from "react";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { ThumbUp, ThumbDown } from "@material-ui/icons";

import { Motions } from "../../constants";
import { motionVar } from "../../apollo/client/localState";
import { CURRENT_USER } from "../../apollo/client/queries";
import { CREATE_VOTE, DELETE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/VoteButtons.module.scss";

interface Props {
  motionId?: string;
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
}

const VoteButtons = ({ motionId, votes, setVotes }: Props) => {
  const motionFromGlobal = useReactiveVar(motionVar);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [upVotes, setUpVotes] = useState<Vote[]>([]);
  const [downVotes, setDownVotes] = useState<Vote[]>([]);
  const [createVote] = useMutation(CREATE_VOTE);
  const [deleteVote] = useMutation(DELETE_VOTE);
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    setUpVotes(votes.filter((vote) => vote.flipState === "up"));
    setDownVotes(votes.filter((vote) => vote.flipState === "down"));
  }, [votes]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const alreadyVote = (): Vote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const alreadyUpVote = (): Vote | null => {
    if (alreadyVote()?.flipState === "up") return alreadyVote();
    return null;
  };

  const alreadyDownVote = (): Vote | null => {
    if (alreadyVote()?.flipState === "down") return alreadyVote();
    return null;
  };

  const buttonColor = (flipState: string): string => {
    if (
      (flipState === "up" && alreadyUpVote()) ||
      (flipState === "down" && alreadyDownVote())
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
      flipState === "up" ? <ThumbUp {...props} /> : <ThumbDown {...props} />;
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
      <VoteButton votes={upVotes} flipState="up" />
      <VoteButton votes={downVotes} flipState="down" />
    </>
  );
};

export default VoteButtons;
