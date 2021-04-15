import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";

import { USER } from "../../apollo/client/queries";

import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";

interface Props {
  userId: string;
}

const GroupMember = ({ userId }: Props) => {
  const [user, setUser] = useState<User>();
  const userRes = useQuery(USER, {
    variables: { id: userId },
  });

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  if (user)
    return (
      <div className={styles.member}>
        <div className={styles.link}>
          <UserAvatar user={user} />
          <Link href={`/users/${user.name}`}>
            <a className={styles.userName}>{user.name}</a>
          </Link>
        </div>
      </div>
    );
  return <>Loading...</>;
};

export default GroupMember;
