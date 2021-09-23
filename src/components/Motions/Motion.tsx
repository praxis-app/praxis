import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery, useReactiveVar } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
  CardActionArea,
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
import GroupItemAvatar from "../Groups/ItemAvatar";
import ActionData from "./ActionData";
import styles from "../../styles/Motion/Motion.module.scss";
import { Stages } from "../../constants/motion";
import { ModelNames, ResourcePaths } from "../../constants/common";
import { GroupSettings } from "../../constants/setting";
import { VotingTypes } from "../../constants/vote";
import { noCache } from "../../utils/apollo";
import {
  useCurrentUser,
  useMembersByGroupId,
  useSettingsByGroupId,
  useUserById,
} from "../../hooks";
import Messages from "../../utils/messages";
import { timeAgo } from "../../utils/time";
import CardFooter from "./CardFooter";
import { settingValue } from "../../utils/setting";

const useStyles = makeStyles({
  title: {
    marginLeft: "-5px",
  },
});

interface Props {
  motion: ClientMotion;
  deleteMotion: (id: string) => void;
}

const Motion = ({ motion, deleteMotion }: Props) => {
  const { id, userId, groupId, motionGroupId, body, action, stage } = motion;
  const currentUser = useCurrentUser();
  const [user] = useUserById(userId);
  const [group, setGroup] = useState<ClientGroup>();
  const [groupSettings] = useSettingsByGroupId(group?.id);
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [votes, setVotes] = useState<ClientVote[]>([]);
  const votesFromGlobal = useReactiveVar(votesVar);
  const [images, setImages] = useState<ClientImage[]>([]);
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
    return router.asPath.includes(ResourcePaths.Motion);
  };

  const onGroupPage = (): boolean => {
    return router.asPath.includes(ResourcePaths.Group);
  };

  const alreadyVote = (): ClientVote | null => {
    if (!currentUser) return null;
    const vote = votes.find((vote) => vote.userId === currentUser.id);
    if (vote) return vote;
    return null;
  };

  const isRatified = (): boolean => {
    return stage === Stages.Ratified;
  };

  const isModelOfConsensus = (): boolean => {
    return (
      settingValue(GroupSettings.VotingType, groupSettings) ===
      VotingTypes.Consensus
    );
  };

  const isAGroupMember = (): boolean => {
    const member = groupMembers?.find(
      (member: ClientGroupMember) => member.userId === currentUser?.id
    );
    return Boolean(member);
  };

  return (
    <div key={id}>
      <Card>
        <CardHeader
          avatar={
            group && !onGroupPage() ? (
              user && (
                <GroupItemAvatar user={user} group={group} motion={motion} />
              )
            ) : (
              <UserAvatar user={user} />
            )
          }
          title={
            (!group || onGroupPage()) && (
              <>
                <Link href={`${ResourcePaths.User}${user?.name}`}>
                  <a>{user?.name}</a>
                </Link>

                <Link href={`${ResourcePaths.Motion}${id}`}>
                  <a className={styles.info}>
                    {(action && Messages.motions.toAction(action)) +
                      timeAgo(motion.createdAt)}
                  </a>
                </Link>
              </>
            )
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={ModelNames.Motion}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteMotion}
              canEdit={ownMotion() && !votes.length}
              canDelete={ownMotion() && !isRatified()}
            />
          }
          classes={classes}
        />

        {body && (
          <CardContent style={{ paddingBottom: 12 }}>
            <Typography
              style={{
                marginTop: "-12px",
              }}
            >
              {body}
            </Typography>

            <ActionData
              id={id}
              action={action}
              actionData={motion.actionData}
            />
          </CardContent>
        )}

        <CardActionArea>
          <CardMedia>
            <ImagesList images={images} />
          </CardMedia>
        </CardActionArea>

        {alreadyVote() && !alreadyVote()?.body && !isRatified() && (
          <VotesForm
            votes={votes}
            vote={alreadyVote() as ClientVote}
            setVotes={onMotionPage() ? votesVar : setVotes}
            modelOfConsensus={isModelOfConsensus()}
          />
        )}

        {currentUser && isAGroupMember() && (
          <CardFooter
            motionId={id}
            votes={votes}
            setVotes={onMotionPage() ? votesVar : setVotes}
            modelOfConsensus={isModelOfConsensus()}
            ratified={isRatified()}
          />
        )}
      </Card>
    </div>
  );
};

export default Motion;
