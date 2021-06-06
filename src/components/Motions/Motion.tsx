import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery, useReactiveVar } from "@apollo/client";
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

import {
  GROUP,
  IMAGES_BY_MOTION_ID,
  VOTES_BY_MOTION_ID,
} from "../../apollo/client/queries";
import { votesVar } from "../../apollo/client/localState";
import VotesForm from "../Votes/Form";
import ImagesList from "../Images/List";
import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import GroupItemAvatars from "../Groups/ItemAvatars";
import VoteButtons from "../Votes/VoteButtons";
import ActionData from "./ActionData";
import styles from "../../styles/Motion/Motion.module.scss";
import { Common, Motions } from "../../constants";
import { noCache } from "../../utils/apollo";
import { useCurrentUser, useUserById } from "../../hooks";
import Messages from "../../utils/messages";

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
}

const Motion = ({ motion, deleteMotion }: Props) => {
  const { id, userId, groupId, motionGroupId, body, action, stage } = motion;
  const currentUser = useCurrentUser();
  const user = useUserById(userId);
  const [group, setGroup] = useState<Group>();
  const [votes, setVotes] = useState<Vote[]>([]);
  const votesFromGlobal = useReactiveVar(votesVar);
  const [images, setImages] = useState<Image[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [getVotesRes, votesRes] = useLazyQuery(VOTES_BY_MOTION_ID, noCache);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP);
  const imagesRes = useQuery(IMAGES_BY_MOTION_ID, {
    variables: { motionId: id },
    ...noCache,
  });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (!onMotionPage())
      getVotesRes({
        variables: { motionId: id },
      });
  }, []);

  useEffect(() => {
    if (onMotionPage()) setVotes(votesFromGlobal);
  }, [votesFromGlobal]);

  useEffect(() => {
    if (!onMotionPage() && votesRes.data)
      setVotes(votesRes.data.votesByMotionId);
  }, [votesRes.data]);

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

  const onMotionPage = (): boolean => {
    return router.asPath.includes("/motions/");
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

  const isRatified = (): boolean => {
    return stage === Motions.Stages.Ratified;
  };

  return (
    <div key={id}>
      <Card className={classes.root + " " + styles.card}>
        <CardHeader
          avatar={
            group && !onGroupPage()
              ? user && (
                  <GroupItemAvatars user={user} group={group} motion={motion} />
                )
              : user && <UserAvatar user={user} />
          }
          title={
            (!group || onGroupPage()) && (
              <>
                <Link href={`/users/${user?.name}`}>
                  <a>{user?.name}</a>
                </Link>

                <Link href={`/motions/${id}`}>
                  <a className={styles.info}>
                    {Messages.motions.toActionWithRatified(
                      action,
                      isRatified()
                    )}
                  </a>
                </Link>
              </>
            )
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={Common.ModelNames.Motion}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteMotion}
              ownItem={ownMotion}
            />
          }
          classes={{ title: classes.title }}
        />

        {body && (
          <CardContent style={{ paddingBottom: 12 }}>
            <Typography
              style={{
                color: "rgb(190, 190, 190)",
                marginTop: "-12px",
                fontFamily: "Inter",
              }}
            >
              {body}
            </Typography>

            <ActionData motion={motion} />
          </CardContent>
        )}

        <CardMedia>
          <ImagesList images={images} />
        </CardMedia>

        {alreadyVote() && !alreadyVote()?.body && !isRatified() && (
          <VotesForm
            votes={votes}
            vote={alreadyVote() as Vote}
            setVotes={onMotionPage() ? votesVar : setVotes}
          />
        )}

        {currentUser && !ownMotion() && (
          <CardActions>
            <VoteButtons
              motionId={id}
              votes={votes}
              setVotes={onMotionPage() ? votesVar : setVotes}
            />
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Motion;
