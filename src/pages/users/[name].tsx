import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import User from "../../components/Users/User";
import Feed from "../../components/Shared/Feed";
import Pagination from "../../components/Shared/Pagination";
import { USER_BY_NAME, PROFILE_FEED } from "../../apollo/client/queries";
import {
  DELETE_USER,
  DELETE_POST,
  DELETE_MOTION,
  LOGOUT_USER,
} from "../../apollo/client/mutations";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { TypeNames } from "../../constants/common";
import { useCurrentUser } from "../../hooks";
import { noCache } from "../../utils/apollo";
import { resetFeed } from "../../utils/clientIndex";

const Show = () => {
  const {
    query: { name },
  } = useRouter();
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const [user, setUser] = useState<User>();
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME);
  const [getFeedRes, feedRes] = useLazyQuery(PROFILE_FEED, noCache);
  const [deleteUser] = useMutation(DELETE_USER);
  const [deletePost] = useMutation(DELETE_POST);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    return () => {
      resetFeed();
    };
  }, []);

  useEffect(() => {
    if (name) {
      getUserRes({
        variables: { name },
      });
    }
  }, [name]);

  useEffect(() => {
    if (name) {
      getFeedRes({
        variables: {
          name,
          pageSize,
          currentPage,
        },
      });

      feedVar({
        ...feed,
        loading: true,
      });
    }
  }, [name, currentPage, pageSize]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.userByName);
  }, [userRes.data]);

  useEffect(() => {
    if (feedRes.data)
      feedVar({
        items: feedRes.data.profileFeed.pagedItems,
        totalItems: feedRes.data.profileFeed.totalItems,
        loading: feedRes.loading,
      });
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
          (item: FeedItem) =>
            item.id !== id || item.__typename !== TypeNames.Post
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
          (item: FeedItem) =>
            item.id !== id || item.__typename !== TypeNames.Motion
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

          <Pagination>
            <Feed
              deleteMotion={deleteMotionHandler}
              deletePost={deletePostHandler}
            />
          </Pagination>
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default Show;
