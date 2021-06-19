import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Card, CardHeader, CardContent } from "@material-ui/core";

import FollowButton from "../Follows/FollowButton";
import ItemMenu from "../Shared/ItemMenu";
import UserAvatar from "./Avatar";
import { FOLLOWERS, FOLLOWING } from "../../apollo/client/queries";
import styles from "../../styles/User/User.module.scss";
import Messages from "../../utils/messages";
import { Common, Roles } from "../../constants";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      backgroundColor: "rgb(65, 65, 65)",
    },
    title: {
      fontFamily: "Inter",
    },
    subheader: {
      fontFamily: "Inter",
      color: "rgb(195, 195, 195)",
    },
  })
);

interface Props {
  user: User;
  deleteUser: (id: string) => void;
}

const Show = ({ user, deleteUser }: Props) => {
  const { name, id, createdAt } = user;
  const currentUser = useCurrentUser();
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const followersRes = useQuery(FOLLOWERS, {
    variables: { userId: id },
    fetchPolicy: "no-cache",
  });
  const followingRes = useQuery(FOLLOWING, {
    variables: { userId: id },
    fetchPolicy: "no-cache",
  });
  const [canManageUsers] = useHasPermissionGlobally(
    Roles.Permissions.ManageUsers
  );
  const classes = useStyles();
  const date = new Date(parseInt(createdAt)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (followersRes.data) setFollowers(followersRes.data.userFollowers);
  }, [followersRes.data]);

  useEffect(() => {
    if (followingRes.data) setFollowing(followingRes.data.userFollowing);
  }, [followingRes.data]);

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <Card className={classes.root + " " + styles.card}>
      <CardHeader
        avatar={user && <UserAvatar user={user} />}
        action={
          <>
            <FollowButton
              userId={id}
              followers={followers}
              setFollowers={setFollowers}
            />
            <ItemMenu
              name={name}
              itemId={id}
              itemType={Common.ModelNames.User}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deleteUser}
              ownItem={() => ownUser()}
              hasPermission={canManageUsers}
            />
          </>
        }
        title={
          <Link href={`/users/${name}`}>
            <a>{name}</a>
          </Link>
        }
        subheader={Messages.users.joinedWithData(date)}
        classes={{ title: classes.title, subheader: classes.subheader }}
      />

      <CardContent>
        <Link href={`/users/${name}/followers`}>
          <a>{Messages.users.followers(followers.length)}</a>
        </Link>

        <span style={{ color: "white" }}> · </span>

        <Link href={`/users/${name}/following`}>
          <a>{Messages.users.following(following.length)}</a>
        </Link>
      </CardContent>
    </Card>
  );
};

export default Show;
