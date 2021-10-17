import { useMutation } from "@apollo/client";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { CREATE_FOLLOW, DELETE_FOLLOW } from "../../apollo/client/mutations";
import styles from "../../styles/Follow/FollowButton.module.scss";
import GhostButton from "../Shared/GhostButton";

interface Props {
  userId: string;
  followers: ClientFollow[];
  setFollowers: (followers: ClientFollow[]) => void;
}

const FollowButton = ({ userId, followers, setFollowers }: Props) => {
  const currentUser = useCurrentUser();
  const [createFollow, { loading: createFollowLoading }] =
    useMutation(CREATE_FOLLOW);
  const [deleteFollow, { loading: deleteFollowLoading }] =
    useMutation(DELETE_FOLLOW);
  const loading = createFollowLoading || deleteFollowLoading;

  const ownUser = (): boolean => {
    if (currentUser) return currentUser.id === userId;
    return false;
  };

  const alreadyFollow = () => {
    const follow = followers?.find(
      (follow) => follow.followerId === currentUser?.id
    );
    return follow;
  };

  const createFollowMutation = async () => {
    const { data } = await createFollow({
      variables: {
        userId,
        followerId: currentUser?.id,
      },
    });
    setFollowers([...followers, data.createFollow.follow]);
  };

  const deleteFollowMutation = async () => {
    await deleteFollow({
      variables: {
        id: alreadyFollow()?.id,
      },
    });
    setFollowers(
      followers.filter((follow) => follow.followerId !== currentUser?.id)
    );
  };

  if (!currentUser || ownUser()) return null;

  if (alreadyFollow())
    return (
      <GhostButton onClick={() => deleteFollowMutation()} disabled={loading}>
        <div className={styles.deleteButtonInner}>
          <span className={styles.followingText}>
            {Messages.users.following()}
          </span>
          <span className={styles.unfollowText}>
            {Messages.users.actions.unfollow()}
          </span>
        </div>
      </GhostButton>
    );

  return (
    <GhostButton onClick={() => createFollowMutation()} disabled={loading}>
      {Messages.users.actions.follow()}
    </GhostButton>
  );
};

export default FollowButton;
