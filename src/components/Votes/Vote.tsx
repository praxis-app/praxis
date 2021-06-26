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
import { Common, Settings, Votes } from "../../constants";
import { noCache } from "../../utils/apollo";
import { useCurrentUser, useSettingsByGroupId, useUserById } from "../../hooks";
import Messages from "../../utils/messages";

const useStyles = makeStyles({
  root: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
    fontSize: 16,
  },
});

interface Props {
  vote: Vote;
  votes: Vote[];
  setVotes: (votes: Vote[]) => void;
}

const Vote = ({
  vote: { id, userId, motionId, body, flipState, consensusState, verified },
  votes,
  setVotes,
}: Props) => {
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

    if (consensusState === Votes.ConsensusStates.Agreement)
      text += Messages.votes.consensus.voteTypes.labels.agreement();
    if (consensusState === Votes.ConsensusStates.Reservations)
      text += Messages.votes.consensus.voteTypes.labels.reservations();
    if (consensusState === Votes.ConsensusStates.StandAside)
      text += Messages.votes.consensus.voteTypes.labels.standAside();
    if (consensusState === Votes.ConsensusStates.Block)
      text += Messages.votes.consensus.voteTypes.labels.block();

    if (flipState)
      text +=
        flipState === Votes.FlipStates.Up
          ? Messages.votes.voteTypeLabel.support()
          : Messages.votes.voteTypeLabel.block();

    if (verified)
      text += Messages.middotWithSpaces() + Messages.votes.verifiedWithCheck();

    return text;
  };

  return (
    <div className={styles.vote} key={id}>
      <div className={styles.avatar}>{user && <UserAvatar user={user} />}</div>

      <Card className={classes.root}>
        <CardHeader
          title={
            <>
              <Link href={`/users/${user?.name}`}>
                <a>{user?.name}</a>
              </Link>
              <span className={styles.voteTypeLabel}>{voteTypeLabel()}</span>
            </>
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={Common.ModelNames.Vote}
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
              color: "rgb(190, 190, 190)",
              marginTop: "-20px",
              fontFamily: "Inter",
            }}
          >
            {body}
          </Typography>
        </CardContent>

        {currentUser &&
          !verified &&
          !ownVote() &&
          !ownMotion() &&
          settingByName(Settings.GroupSettings.VoteVerification) ===
            Settings.States.On && (
            <CardActions style={{ marginTop: "6px" }}>
              <Button
                onClick={() => verifyVoteMutation()}
                style={{ color: "white" }}
              >
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
