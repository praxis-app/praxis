import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";

import { CURRENT_USER, FOLLOWERS } from "../../apollo/client/queries";
import { CREATE_FOLLOW, DELETE_FOLLOW } from "../../apollo/client/mutations";

const FollowButton = ({ userId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const currentUserRes = useQuery(CURRENT_USER);
  const [createFollow] = useMutation(CREATE_FOLLOW);
  const [deleteFollow] = useMutation(DELETE_FOLLOW);
  const followersRes = useQuery(FOLLOWERS, {
    variables: { userId: userId },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    setCurrentUser(currentUserRes.data ? currentUserRes.data.user : null);
  }, [currentUserRes.data]);

  useEffect(() => {
    setFollowers(followersRes.data ? followersRes.data.userFollowers : []);
  }, [followersRes.data]);

  const notThisUser = (): boolean => {
    return currentUser && currentUser.id !== parseInt(userId);
  };

  const alreadyFollow = (): Follow => {
    const follow = followers?.find(
      (follow) => parseInt(follow.followerId) === currentUser.id
    );

    if (follow) return follow;
    return null;
  };

  const createFollowMutation = async () => {
    const { data } = await createFollow({
      variables: {
        userId: userId,
        followerId: currentUser.id,
      },
    });
    setFollowers([...followers, data.createFollow.follow]);
  };

  const deleteFollowMutation = async () => {
    await deleteFollow({
      variables: {
        id: alreadyFollow().id,
      },
    });
    setFollowers(
      followers.filter(
        (follow) => parseInt(follow.followerId) !== currentUser.id
      )
    );
  };

  return (
    <>
      {notThisUser() && (
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
