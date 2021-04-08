import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Card, CardActions, CardHeader, CardContent } from "@material-ui/core";
import { Edit, Delete } from "@material-ui/icons";

import baseUrl from "../../utils/baseUrl";
import FollowButton from "../Follows/FollowButton";
import UserAvatar from "./Avatar";

import {
  FOLLOWERS,
  FOLLOWING,
  CURRENT_USER,
} from "../../apollo/client/queries";

import styles from "../../styles/User/User.module.scss";

const useStyles = makeStyles((theme: Theme) =>
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
  const { name, email, id, createdAt } = user;
  const [currentUser, setCurrentUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const followersRes = useQuery(FOLLOWERS, {
    variables: { userId: id },
    fetchPolicy: "no-cache",
  });
  const followingRes = useQuery(FOLLOWING, {
    variables: { userId: id },
    fetchPolicy: "no-cache",
  });
  const currentUserRes = useQuery(CURRENT_USER);

  const classes = useStyles();
  const date = new Date(parseInt(createdAt)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    setCurrentUser(currentUserRes.data ? currentUserRes.data.user : null);
  }, [currentUserRes.data]);

  useEffect(() => {
    setFollowers(followersRes.data ? followersRes.data.userFollowers : []);
  }, [followersRes.data]);

  useEffect(() => {
    setFollowing(followingRes.data ? followingRes.data.userFollowing : []);
  }, [followingRes.data]);

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <Card className={classes.root + " " + styles.card}>
      <CardHeader
        avatar={
          <Link href={`/users/${name}`}>
            <a>{user && <UserAvatar user={user} />}</a>
          </Link>
        }
        action={<FollowButton userId={id} />}
        title={
          <Link href={`/users/${name}`}>
            <a>
              {name} · {email}
            </a>
          </Link>
        }
        subheader={`Joined ${date}`}
        classes={{ title: classes.title, subheader: classes.subheader }}
      />

      <CardContent>
        <Link href={`/users/${name}/followers`}>
          <a>{followers?.length} Followers</a>
        </Link>

        <span style={{ color: "white" }}> · </span>

        <Link href={`/users/${name}/following`}>
          <a>{following?.length} Following</a>
        </Link>
      </CardContent>

      {ownUser() && (
        <CardActions>
          <Link href={`/users/${name}/edit`}>
            <a>
              <Edit /> Edit
            </a>
          </Link>

          <Link href="/users">
            <a
              onClick={() =>
                window.confirm("Are you sure you want to delete this user?") &&
                deleteUser(id)
              }
            >
              <Delete /> Delete
            </a>
          </Link>
        </CardActions>
      )}
    </Card>
  );
};

export default Show;
