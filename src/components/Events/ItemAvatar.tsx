import Link from "next/link";
import UserAvatar from "../Users/Avatar";
import styles from "../../styles/User/ItemAvatar.module.scss";
import { ResourcePaths, TAB_QUERY_PARAM } from "../../constants/common";
import { timeAgo } from "../../utils/time";
import EventAvatar from "./Avatar";
import { EventTabs } from "./PageHeader";

interface Props {
  user: ClientUser | undefined;
  event: ClientEvent;
  post: ClientPost;
}

const EventItemAvatar = ({ user, event, post }: Props) => {
  return (
    <div className={styles.avatar}>
      <div className={styles.avatarLinks}>
        <EventAvatar event={event} />

        <div className={styles.avatarSmall}>
          <UserAvatar user={user} />
        </div>
      </div>
      <div className={styles.parentItemLinks}>
        <Link
          href={`${ResourcePaths.Event}${event.id}${TAB_QUERY_PARAM}${EventTabs.Discussion}`}
        >
          <a className={styles.parentNameLink}>{event.name}</a>
        </Link>
        <Link href={`${ResourcePaths.Post}${post.id}`}>
          <a className={styles.postByLink}>
            {user?.name}
            {timeAgo(post.createdAt)}
          </a>
        </Link>
      </div>
    </div>
  );
};

export default EventItemAvatar;
