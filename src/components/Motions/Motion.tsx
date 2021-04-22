import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery } from "@apollo/client";
import { Edit, Delete } from "@material-ui/icons";
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
} from "../../apollo/client/queries";
import LikeButton from "../Likes/LikeButton";
import UserAvatar from "../Users/Avatar";

import styles from "../../styles/Motion/Motion.module.scss";
import GroupPostAvatars from "../Posts/GroupPostAvatars";

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

const Motion = ({
  motion: { id, userId, groupId, motionGroupId, body, action },
  deleteMotion,
}: Props) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [user, setUser] = useState<User>();
  const [group, setGroup] = useState<Group>();
  const [images, setImages] = useState([]);
  const currentUserRes = useQuery(CURRENT_USER);
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });
  const [getGroupRes, groupRes] = useLazyQuery(GROUP);
  const imagesRes = useQuery(IMAGES_BY_MOTION_ID, {
    variables: { motionId: id },
    fetchPolicy: "no-cache",
  });
  const classes = useStyles();
  const router = useRouter();

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

  return (
    <div key={id}>
      <Card className={classes.root + " " + styles.card}>
        <CardHeader
          avatar={
            group && !onGroupPage()
              ? user && (
                  <GroupPostAvatars user={user} group={group} motion={true} />
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

        {isLoggedIn(currentUser) && (
          <CardActions style={{ marginTop: "6px" }}>
            <LikeButton motionId={id} />

            {ownMotion() && (
              <>
                <Link href={`/motions/${id}/edit`}>
                  <a>
                    <Edit /> Edit
                  </a>
                </Link>

                <Link href={router.asPath}>
                  <a
                    onClick={() =>
                      window.confirm(
                        "Are you sure you want to delete this motion?"
                      ) && deleteMotion(id)
                    }
                  >
                    <Delete /> Delete
                  </a>
                </Link>
              </>
            )}
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Motion;
