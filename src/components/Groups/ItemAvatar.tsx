import Link from "next/link";
import UserAvatar from "../Users/Avatar";
import GroupAvatar from "./Avatar";
import styles from "../../styles/Group/ItemAvatar.module.scss";
import { ModelNames, ResourcePaths } from "../../constants/common";
import { Stages } from "../../constants/motion";
import Messages from "../../utils/messages";
import { timeAgo } from "../../utils/time";

interface Props {
  user: User;
  group: Group;
  motion?: Motion;
  post?: Post;
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

  if (user && group)
    return (
      <div className={styles.avatar}>
        <div className={styles.avatarLinks}>
          <GroupAvatar group={group} />
          {user && (
            <div className={styles.avatarSmall}>
              <UserAvatar user={user} />
            </div>
          )}
        </div>
        <div className={styles.groupPostLinks}>
          <Link href={`${ResourcePaths.Group}${group.name}`}>
            <a className={styles.groupNameLink}>{group.name}</a>
          </Link>
          <Link href={itemHref()}>
            <a className={styles.postByLink}>
              {Messages.groups.itemWithNameAndRatified(
                motion ? ModelNames.Motion : ModelNames.Post,
                user.name,
                motion?.stage === Stages.Ratified
              )}
              {timeAgo(createdAt())}
            </a>
          </Link>
        </div>
      </div>
    );
  return <></>;
};

export default GroupItemAvatar;
