import { useState } from "react";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  CardHeader,
} from "@material-ui/core";

import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import { DELETE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/Vote.module.scss";
import { ModelNames, ResourcePaths } from "../../constants/common";
import { ConsensusStates, FlipStates } from "../../constants/vote";
import { useCurrentUser, useUserById } from "../../hooks";
import Messages from "../../utils/messages";
import { timeAgo } from "../../utils/time";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  title: {
    fontSize: 16,
  },
});

interface Props {
  vote: ClientVote;
  votes: ClientVote[];
  setVotes: (votes: ClientVote[]) => void;
}

const Vote = ({ vote, votes, setVotes }: Props) => {
  const { id, userId, body, flipState, consensusState, createdAt } = vote;
  const currentUser = useCurrentUser();
  const [user] = useUserById(userId);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteVote] = useMutation(DELETE_VOTE);
  const classes = useStyles();

  const ownVote = (): boolean => {
    if (currentUser && user) return currentUser.id === user.id;
    return false;
  };

  const deleteVoteHandler = async (id: string) => {
    await deleteVote({
      variables: {
        id,
      },
    });
    setVotes(votes.filter((vote: ClientVote) => vote.id !== id));
  };

  const voteTypeLabel = (): string => {
    let text = Messages.middotWithSpaces();

    if (consensusState === ConsensusStates.Agreement)
      text += Messages.votes.consensus.voteTypes.labels.agreement();
    if (consensusState === ConsensusStates.Reservations)
      text += Messages.votes.consensus.voteTypes.labels.reservations();
    if (consensusState === ConsensusStates.StandAside)
      text += Messages.votes.consensus.voteTypes.labels.standAside();
    if (consensusState === ConsensusStates.Block)
      text += Messages.votes.consensus.voteTypes.labels.block();

    if (flipState)
      text +=
        flipState === FlipStates.Up
          ? Messages.votes.voteTypeLabel.agreement()
          : Messages.votes.voteTypeLabel.disagreement();

    return text;
  };

  return (
    <div className={styles.vote} key={id}>
      <div className={styles.avatar}>{<UserAvatar user={user} />}</div>

      <Card className={classes.root}>
        <CardHeader
          title={
            <>
              <Link href={`${ResourcePaths.User}${user?.name}`}>
                <a>{user?.name}</a>
              </Link>
              <span className={styles.voteTypeLabel}>{voteTypeLabel()}</span>
              <span className={styles.timeAgo}>{timeAgo(createdAt)}</span>
            </>
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={ModelNames.Vote}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteVoteHandler}
              canEdit={ownVote()}
              canDelete={ownVote()}
            />
          }
          classes={{ title: classes.title }}
        />
        <CardContent>
          <Typography
            style={{
              marginTop: "-20px",
            }}
          >
            {body}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vote;
