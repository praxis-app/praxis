import Link from "next/link";
import UserAvatar from "../Users/Avatar";
import GroupAvatar from "./Avatar";
import styles from "../../styles/User/ItemAvatar.module.scss";
import { ResourcePaths } from "../../constants/common";
import { timeAgo } from "../../utils/time";

interface Props {
  user: ClientUser | undefined;
  group: ClientGroup;
  motion?: ClientMotion;
  post?: ClientPost;
}

const GroupItemAvatar = ({ user, group, motion, post }: Props) => {
  const createdAt = (): string => {
    if (motion) return motion.createdAt;
    if (post) return post.createdAt;
    return "";
  };

  const itemHref = (): string => {
    if (motion) return `${ResourcePaths.Motion}${motion.id}`;
    if (post) return `${ResourcePaths.Post}${post?.id}`;
    return "";
  };

  return (
    <div className={styles.avatar}>
      <div className={styles.avatarLinks}>
        <GroupAvatar group={group} />
        <div className={styles.avatarSmall}>
          <UserAvatar user={user} />
        </div>
      </div>
      <div className={styles.parentItemLinks}>
        <Link href={`${ResourcePaths.Group}${group.name}`}>
          <a className={styles.parentNameLink}>{group.name}</a>
        </Link>
        <Link href={itemHref()}>
          <a className={styles.postByLink}>
            {user?.name}
            {timeAgo(createdAt())}
          </a>
        </Link>
      </div>
    </div>
  );
};

export default GroupItemAvatar;
