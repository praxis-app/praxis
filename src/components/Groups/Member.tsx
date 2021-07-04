import Link from "next/link";
import { CircularProgress } from "@material-ui/core";

import FollowButton from "../Follows/FollowButton";
import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";
import { useUserById, useFollowersByUserId } from "../../hooks";

interface Props {
  userId: string;
}

const GroupMember = ({ userId }: Props) => {
  const user = useUserById(userId);
  const [followers, setFollowers] = useFollowersByUserId(userId);

  if (user)
    return (
      <div className={styles.member}>
        <div className={styles.link}>
          <UserAvatar user={user} />
          <Link href={`/users/${user.name}`}>
            <a className={styles.userName}>{user.name}</a>
          </Link>
        </div>

        <FollowButton
          userId={userId}
          followers={followers}
          setFollowers={setFollowers}
        />
      </div>
    );
  return <CircularProgress style={{ color: "white", display: "block" }} />;
};

export default GroupMember;
