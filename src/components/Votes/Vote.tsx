import { useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
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
import { isLoggedIn } from "../../utils/auth";
import {
  USER,
  MOTION,
  CURRENT_USER,
  SETTINGS_BY_GROUP_ID,
} from "../../apollo/client/queries";
import { VERIFY_VOTE, DELETE_VOTE } from "../../apollo/client/mutations";
import styles from "../../styles/Vote/Vote.module.scss";
import { Settings } from "../../constants";

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
  vote: { id, userId, motionId, body, flipState, verified },
  votes,
  setVotes,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [groupSettings, setGroupSettings] = useState<Setting[]>([]);
  const [motion, setMotion] = useState<Motion>();
  const [user, setUser] = useState<User>();
  const currentUserRes = useQuery(CURRENT_USER);
  const noCache: {} = {
    fetchPolicy: "no-cache",
  };
  const userRes = useQuery(USER, {
    variables: { id: userId },
    ...noCache,
  });
  const motionRes = useQuery(MOTION, {
    variables: {
      id: motionId,
    },
    ...noCache,
  });
  const [getGroupSettingsRes, groupSettingsRes] = useLazyQuery(
    SETTINGS_BY_GROUP_ID,
    noCache
  );
  const [deleteVote] = useMutation(DELETE_VOTE);
  const [verifyVote] = useMutation(VERIFY_VOTE);
  const classes = useStyles();

  useEffect(() => {
    setCurrentUser(currentUserRes.data ? currentUserRes.data.user : null);
  }, [currentUserRes.data]);

  useEffect(() => {
    setUser(userRes.data ? userRes.data.user : null);
  }, [userRes.data]);

  useEffect(() => {
    if (motionRes.data) setMotion(motionRes.data.motion);
  }, [motionRes.data]);

  useEffect(() => {
    if (groupSettingsRes.data)
      setGroupSettings(groupSettingsRes.data.settingsByGroupId);
  }, [groupSettingsRes.data]);

  useEffect(() => {
    if (motion)
      getGroupSettingsRes({
        variables: {
          groupId: motion.groupId,
        },
      });
  }, [motion]);

  const ownVote = (): boolean => {
    if (isLoggedIn(currentUser) && currentUser && user)
      return currentUser.id === user.id;
    return false;
  };

  const ownMotion = (): boolean => {
    if (isLoggedIn(currentUser) && currentUser && motion)
      return currentUser.id === motion.userId;
    return false;
  };

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const deleteVoteHandler = async (id: string) => {
    try {
      await deleteVote({
        variables: {
          id,
        },
      });
      setVotes(votes.filter((vote: Vote) => vote.id !== id));
    } catch {}
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
              <span className={styles.voteTypeText}>
                {" · Vote"} {flipState === "up" ? " of support" : " to block"}
                {verified && " · Verified ✓"}
              </span>
            </>
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={"vote"}
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

        {isLoggedIn(currentUser) &&
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
