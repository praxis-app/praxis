import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery } from "@apollo/client";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
} from "@material-ui/core";

import { isLoggedIn } from "../../utils/auth";
import ImagesList from "../Images/List";
import {
  USER,
  GROUP,
  CURRENT_USER,
  IMAGES_BY_MOTION_ID,
  VOTES_BY_MOTION_ID,
} from "../../apollo/client/queries";
import VotesForm from "../Votes/Form";
import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import GroupItemAvatars from "../Groups/ItemAvatars";
import VoteButtons from "../Votes/VoteButtons";
import styles from "../../styles/Motion/Motion.module.scss";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
    marginLeft: "-5px",
  },
});

interface Props {
  motion: Motion;
  deleteMotion: (id: string) => void;
  votesFromParent?: Vote[];
  setVotesFromParent?: (votes: Vote[]) => void;
}

const Motion = ({
  motion: { id, userId, groupId, motionGroupId, body, action },
  deleteMotion,
  votesFromParent,
  setVotesFromParent,
}: Props) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [user, setUser] = useState<User>();
  const [group, setGroup] = useState<Group>();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const currentUserRes = useQuery(CURRENT_USER);
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });
  const [getVotesRes, votesRes] = useLazyQuery(VOTES_BY_MOTION_ID, {
    fetchPolicy: "no-cache",
  });
  const [getGroupRes, groupRes] = useLazyQuery(GROUP);
  const imagesRes = useQuery(IMAGES_BY_MOTION_ID, {
    variables: { motionId: id },
    fetchPolicy: "no-cache",
  });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (!votesFromParent)
      getVotesRes({
        variables: { motionId: id },
      });
  }, []);

  useEffect(() => {
    if (votesFromParent) setVotes(votesFromParent);
  }, [votesFromParent]);

  useEffect(() => {
    if (!votesFromParent && votesRes.data)
      setVotes(votesRes.data.votesByMotionId);
  }, [votesRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (imagesRes.data) setImages(imagesRes.data.imagesByMotionId);
  }, [imagesRes.data]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.group);
  }, [groupRes.data]);

  useEffect(() => {
    if (groupId || motionGroupId)
      getGroupRes({
        variables: { id: groupId ? groupId : motionGroupId },
      });
  }, [groupId, motionGroupId]);

  const ownMotion = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  const onGroupPage = (): boolean => {
    return router.asPath.includes("/groups/");
  };

  const alreadyVote = (): Vote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  return (
    <div key={id}>
      <Card className={classes.root + " " + styles.card}>
        <CardHeader
          avatar={
            group && !onGroupPage()
              ? user && (
                  <GroupItemAvatars user={user} group={group} motion={true} />
                )
              : user && <UserAvatar user={user} />
          }
          title={
            (!group || onGroupPage()) && (
              <Link href={`/users/${user?.name}`}>
                <a>{user?.name}</a>
              </Link>
            )
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={"motion"}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteMotion}
              ownItem={ownMotion}
            />
          }
          classes={{ title: classes.title }}
        />

        {body && (
          <CardContent>
            <Typography
              style={{
                color: "rgb(190, 190, 190)",
                marginTop: "-12px",
                fontFamily: "Inter",
              }}
            >
              {body} ({action})
            </Typography>
          </CardContent>
        )}

        <CardMedia>
          <ImagesList images={images} />
        </CardMedia>

        {alreadyVote() && !alreadyVote()?.body && (
          <VotesForm
            votes={votes}
            vote={alreadyVote() as Vote}
            setVotes={setVotesFromParent ? setVotesFromParent : setVotes}
          />
        )}

        {isLoggedIn(currentUser) && !ownMotion() && (
          <CardActions style={{ marginTop: "6px" }}>
            <VoteButtons
              motionId={id}
              votes={votes}
              setVotes={setVotesFromParent ? setVotesFromParent : setVotes}
            />
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Motion;
