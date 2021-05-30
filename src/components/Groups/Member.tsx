import Link from "next/link";

import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";
import Messages from "../../utils/messages";
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
  return <>{Messages.states.loading()}</>;
};

export default GroupMember;
