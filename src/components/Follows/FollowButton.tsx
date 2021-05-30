import { useMutation } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";

import { CREATE_FOLLOW, DELETE_FOLLOW } from "../../apollo/client/mutations";
import { useCurrentUser } from "../../hooks";

interface Props {
  userId: string;
  followers: Follow[];
  setFollowers: (followers: Follow[]) => void;
}

const FollowButton = ({ userId, followers, setFollowers }: Props) => {
  const currentUser = useCurrentUser();
  const [createFollow] = useMutation(CREATE_FOLLOW);
  const [deleteFollow] = useMutation(DELETE_FOLLOW);

  const notThisUser = (): boolean => {
    if (currentUser) return currentUser.id !== userId;
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
        userId: userId,
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

  return (
    <>
      {currentUser && notThisUser() && (
        <>
          {alreadyFollow() ? (
            <IconButton onClick={() => deleteFollowMutation()}>
              <RemoveCircle style={{ color: "white" }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => createFollowMutation()}>
              <AddCircle style={{ color: "white" }} />
            </IconButton>
          )}
        </>
      )}
    </>
  );
};

export default FollowButton;
