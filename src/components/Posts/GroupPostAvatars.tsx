import Link from "next/link";

import UserAvatar from "../Users/Avatar";
import GroupAvatar from "../Groups/Avatar";
import styles from "../../styles/Post/GroupPostAvatars.module.scss";

interface Props {
  user: User;
  group: Group;
  motion?: boolean;
}

const GroupPostAvatars = ({ user, group, motion = false }: Props) => {
  if (user && group)
    return (
      <div className={styles.avatars}>
        <div className={styles.avatarLinks}>
          <GroupAvatar group={group} />
          {user && (
            <div className={styles.avatarSmall}>
              <UserAvatar user={user} />
            </div>
          )}
        </div>
        <div className={styles.groupPostLinks}>
          <Link href={`/groups/${group.name}`}>
            <a className={styles.groupNameLink}>{group.name}</a>
          </Link>
          <Link href={`/users/${user.name}`}>
            <a className={styles.postByLink}>
              Group {motion ? "motion" : "post"} by {user.name}
            </a>
          </Link>
        </div>
      </div>
    );
  return <></>;
};

export default GroupPostAvatars;
