import { useEffect } from "react";
import { useMutation, useReactiveVar, useLazyQuery } from "@apollo/client";

import PostForm from "../components/Posts/Form";
import Feed from "../components/Shared/Feed";
import { HOME_FEED } from "../apollo/client/queries";
import { DELETE_POST, DELETE_MOTION } from "../apollo/client/mutations";
import WelcomeCard from "../components/About/Welcome";
import { TypeNames } from "../constants/common";
import { feedVar, paginationVar } from "../apollo/client/localState";
import { useCurrentUser } from "../hooks";
import { noCache, resetFeed } from "../utils/clientIndex";
import Pagination from "../components/Shared/Pagination";

const Home = () => {
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);
  const [getFeedRes, feedRes] = useLazyQuery(HOME_FEED, noCache);

  useEffect(() => {
    return () => {
      resetFeed();
    };
  }, []);

  useEffect(() => {
    getFeedRes({
      variables: {
        userId: currentUser?.id,
        currentPage,
        pageSize,
      },
    });

    feedVar({
      ...feed,
      loading: true,
    });
  }, [currentUser, currentPage, pageSize]);

  useEffect(() => {
    if (feedRes.data)
      feedVar({
        items: feedRes.data.homeFeed.pagedItems,
        totalItems: feedRes.data.homeFeed.totalItems,
        loading: feedRes.loading,
      });
  }, [feedRes.data]);

  const deletePostHandler = async (id: string) => {
    await deletePost({
      variables: {
        id,
      },
    });
    feedVar({
      ...feed,
      items: feed.items.filter(
        (item: FeedItem) => item.id !== id || item.__typename !== TypeNames.Post
      ),
      totalItems: feed.totalItems - 1,
    });
  };

  const deleteMotionHandler = async (id: string) => {
    await deleteMotion({
      variables: {
        id,
      },
    });
    feedVar({
      ...feed,
      items: feed.items.filter(
        (item: FeedItem) =>
          item.id !== id || item.__typename !== TypeNames.Motion
      ),
      totalItems: feed.totalItems - 1,
    });
  };

  return (
    <>
      <WelcomeCard isLoggedIn={!!currentUser} />

      {currentUser && <PostForm posts={feed.items} />}

      <Pagination>
        <Feed
          deletePost={deletePostHandler}
          deleteMotion={deleteMotionHandler}
        />
      </Pagination>
    </>
  );
};

export default Home;
