import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import User from "../../components/Users/User";
import Feed from "../../components/Shared/Feed";
import { USER_BY_NAME, PROFILE_FEED } from "../../apollo/client/queries";
import {
  DELETE_USER,
  DELETE_POST,
  DELETE_MOTION,
  LOGOUT_USER,
} from "../../apollo/client/mutations";
import { feedItemsVar } from "../../apollo/client/localState";
import { Common } from "../../constants";
import { useCurrentUser } from "../../hooks";
import { noCache } from "../../utils/apollo";

const Show = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedItemsVar);
  const [user, setUser] = useState<User>();
  const [loadingFeed, setLoadingFeed] = useState<boolean>(true);
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME);
  const [getFeedRes, feedRes] = useLazyQuery(PROFILE_FEED, noCache);
  const [deleteUser] = useMutation(DELETE_USER);
  const [deletePost] = useMutation(DELETE_POST);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    const vars = {
      variables: { name: query.name },
    };
    if (query.name) {
      getUserRes(vars);
      getFeedRes(vars);
    }
  }, [query.name]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.userByName);
  }, [userRes.data]);

  useEffect(() => {
    if (feedRes.data) {
      feedItemsVar(feedRes.data.profileFeed);
      setLoadingFeed(false);
    }
  }, [feedRes.data]);

  const deleteUserHandler = async (userId: string) => {
    await deleteUser({
      variables: {
        id: userId,
      },
    });
    if (ownUser()) {
      await logoutUser();
      Router.push("/");
    } else Router.push("/users");
  };

  const deletePostHandler = async (id: string) => {
    await deletePost({
      variables: {
        id,
      },
    });
    feedItemsVar(
      feed.filter(
        (post: FeedItem) =>
          post.id !== id || post.__typename !== Common.TypeNames.Post
      )
    );
  };

  const deleteMotionHandler = async (id: string) => {
    await deleteMotion({
      variables: {
        id,
      },
    });
    feedItemsVar(
      feed.filter(
        (motion: FeedItem) =>
          motion.id !== id || motion.__typename !== Common.TypeNames.Motion
      )
    );
  };

  const ownUser = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <>
      {user ? (
        <>
          <User user={user} deleteUser={deleteUserHandler} />
          <Feed
            loading={loadingFeed}
            deleteMotion={deleteMotionHandler}
            deletePost={deletePostHandler}
          />
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default Show;
