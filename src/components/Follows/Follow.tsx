import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";

import { USER, FOLLOWERS } from "../../apollo/client/queries";

import UserAvatar from "../Users/Avatar";
import FollowButton from "./FollowButton";
import styles from "../../styles/Follow/Follow.module.scss";

interface Props {
  userId: string;
}

const Follow = ({ userId }: Props) => {
  const [user, setUser] = useState<User>();
  const [followers, setFollowers] = useState<Follow[]>([]);
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });
  const followersRes = useQuery(FOLLOWERS, {
    variables: { userId: userId },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  useEffect(() => {
    if (followersRes.data) setFollowers(followersRes.data.userFollowers);
  }, [followersRes.data]);

  if (user)
    return (
      <div className={styles.follow}>
        <div className={styles.link}>
          <UserAvatar user={user} />
          <div className={styles.userName}>{user.name}</div>
        </div>
        <FollowButton
          userId={userId}
          followers={followers}
          setFollowers={setFollowers}
        />
      </div>
    );
  return <>Loading...</>;
};

export default Follow;
