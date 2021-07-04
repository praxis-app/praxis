import Link from "next/link";
import { CircularProgress } from "@material-ui/core";

import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";
import { useUserById } from "../../hooks";

interface Props {
  userId: string;
}

const GroupMember = ({ userId }: Props) => {
  const user = useUserById(userId);

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
  return <CircularProgress style={{ color: "white", display: "block" }} />;
};

export default GroupMember;
