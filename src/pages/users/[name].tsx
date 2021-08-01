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
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { Common } from "../../constants";
import { useCurrentUser } from "../../hooks";
import { noCache } from "../../utils/apollo";
import PageButtons from "../../components/Shared/PageButtons";

const Show = () => {
  const {
    query: { name },
  } = useRouter();
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const paginationState = useReactiveVar(paginationVar);
  const [user, setUser] = useState<User>();
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME);
  const [getFeedRes, feedRes] = useLazyQuery(PROFILE_FEED, noCache);
  const [deleteUser] = useMutation(DELETE_USER);
  const [deletePost] = useMutation(DELETE_POST);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    if (name) {
      getUserRes({
        variables: { name },
      });
    }
  }, [name]);

  useEffect(() => {
    if (name && paginationState) {
      const { currentPage, pageSize } = paginationState;
      getFeedRes({
        variables: {
          name,
          pageSize,
          currentPage,
        },
      });
    }
  }, [name, paginationState]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.userByName);
  }, [userRes.data]);

  useEffect(() => {
    if (feedRes.data) {
      feedVar({
        items: feedRes.data.profileFeed.pagedItems,
        totalItems: feedRes.data.profileFeed.totalItems,
        loading: feedRes.loading,
      });
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
    if (feed)
      feedVar({
        ...feed,
        items: feed.items.filter(
          (post: FeedItem) =>
            post.id !== id || post.__typename !== Common.TypeNames.Post
        ),
      });
  };

  const deleteMotionHandler = async (id: string) => {
    await deleteMotion({
      variables: {
        id,
      },
    });
    if (feed)
      feedVar({
        ...feed,
        items: feed.items.filter(
          (motion: FeedItem) =>
            motion.id !== id || motion.__typename !== Common.TypeNames.Motion
        ),
      });
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

          <PageButtons />
          <Feed
            deleteMotion={deleteMotionHandler}
            deletePost={deletePostHandler}
          />
          <PageButtons bottom />
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default Show;
