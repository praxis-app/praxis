import Link from "next/link";
import { LinearProgress, Typography } from "@material-ui/core";
import UserAvatar from "../Users/Avatar";
import FollowButton from "./FollowButton";
import styles from "../../styles/Follow/Follow.module.scss";
import { useUserById, useFollowersByUserId } from "../../hooks";
import { ResourcePaths, TypeNames } from "../../constants/common";
import Messages from "../../utils/messages";

interface Props {
  userId: string;
}

const Follow = ({ userId }: Props) => {
  const [user, _, userLoading] = useUserById(userId);
  const [followers, setFollowers] = useFollowersByUserId(user?.id);

  if (userLoading) return <LinearProgress />;

  if (!user)
    return <Typography>{Messages.items.notFound(TypeNames.Follow)}</Typography>;

  return (
    <div className={styles.follow}>
      <div className={styles.link}>
        <UserAvatar user={user} />
        <Link href={`${ResourcePaths.User}${user.name}`}>
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
};

export default Follow;
