import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  CardHeader,
  CardActions,
  Button,
} from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";

import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import { MOTION } from "../../apollo/client/queries";
import { VERIFY_VOTE, DELETE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/Vote.module.scss";
import { ModelNames } from "../../constants/common";
import { ConsensusStates, FlipStates } from "../../constants/vote";
import { GroupSettings, SettingStates } from "../../constants/setting";
import { noCache } from "../../utils/apollo";
import { useCurrentUser, useSettingsByGroupId, useUserById } from "../../hooks";
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
  vote: Vote;
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
}

const Vote = ({ vote, votes, setVotes }: Props) => {
  const {
    id,
    userId,
    motionId,
    body,
    flipState,
    consensusState,
    verified,
    createdAt,
  } = vote;
  const currentUser = useCurrentUser();
  const user = useUserById(userId);
  const [motion, setMotion] = useState<Motion>();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [groupSettings] = useSettingsByGroupId(motion?.groupId);
  const motionRes = useQuery(MOTION, {
    variables: {
      id: motionId,
    },
    ...noCache,
  });
  const [deleteVote] = useMutation(DELETE_VOTE);
  const [verifyVote] = useMutation(VERIFY_VOTE);
  const classes = useStyles();

  useEffect(() => {
    if (motionRes.data) setMotion(motionRes.data.motion);
  }, [motionRes.data]);

  const ownVote = (): boolean => {
    if (currentUser && user) return currentUser.id === user.id;
    return false;
  };

  const ownMotion = (): boolean => {
    if (currentUser && motion) return currentUser.id === motion.userId;
    return false;
  };

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const deleteVoteHandler = async (id: string) => {
    await deleteVote({
      variables: {
        id,
      },
    });
    setVotes(votes.filter((vote: Vote) => vote.id !== id));
  };

  const verifyVoteMutation = async () => {
    const { data } = await verifyVote({
      variables: {
        id,
      },
    });
    setVotes(
      votes.map((vote) => {
        const newVote: Vote = data.verifyVote.vote;
        if (vote.id === newVote.id)
          return {
            ...vote,
            verified: newVote.verified,
          };
        return vote;
      })
    );
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
          ? Messages.votes.voteTypeLabel.support()
          : Messages.votes.voteTypeLabel.block();

    if (verified)
      text += Messages.middotWithSpaces() + Messages.votes.verifiedWithCheck();

    return text;
  };

  return (
    <div className={styles.vote} key={id}>
      <div className={styles.avatar}>{<UserAvatar user={user} />}</div>

      <Card className={classes.root}>
        <CardHeader
          title={
            <>
              <Link href={`/users/${user?.name}`}>
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
              ownItem={ownVote}
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

        {currentUser &&
          !verified &&
          !ownVote() &&
          !ownMotion() &&
          settingByName(GroupSettings.VoteVerification) ===
            SettingStates.On && (
            <CardActions style={{ marginTop: "6px" }}>
              <Button onClick={() => verifyVoteMutation()} color="primary">
                <CheckCircle style={{ marginRight: "5px" }} />
                Verify
              </Button>
            </CardActions>
          )}
      </Card>
    </div>
  );
};

export default Vote;
