import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";

import { USER } from "../../apollo/client/queries";

import UserAvatar from "../Users/Avatar";
import FollowButton from "./FollowButton";
import styles from "../../styles/Follow/Follow.module.scss";

const Follow = ({ userId }) => {
  const [user, setUser] = useState(null);
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });

  useEffect(() => {
    setUser(userRes.data ? userRes.data.user : null);
  }, [userRes.data]);

  if (user)
    return (
      <div className={styles.follow}>
        <Link href={`/users/${user.name}`}>
          <a className={styles.link}>
            <UserAvatar user={user} />
            <div className={styles.userName}>{user.name}</div>
          </a>
        </Link>
        <FollowButton userId={userId} />
      </div>
    );
  return <>Loading...</>;
};

export default Follow;
