import { useEffect } from "react";
import { useMutation, useReactiveVar, useLazyQuery } from "@apollo/client";

import PostForm from "../components/Posts/Form";
import Feed from "../components/Shared/Feed";
import { HOME_FEED } from "../apollo/client/queries";
import { DELETE_POST, DELETE_MOTION } from "../apollo/client/mutations";
import WelcomeCard from "../components/About/Welcome";
import { Common } from "../constants";
import { feedVar, paginationVar } from "../apollo/client/localState";
import { useCurrentUser } from "../hooks";
import { noCache } from "../utils/apollo";
import PageButtons from "../components/Shared/PageButtons";

const Home = () => {
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const paginationState = useReactiveVar(paginationVar);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);
  const [getFeedRes, feedRes] = useLazyQuery(HOME_FEED, noCache);

  useEffect(() => {
    if (paginationState) {
      const { currentPage, pageSize } = paginationState;
      getFeedRes({
        variables: {
          userId: currentUser?.id,
          currentPage,
          pageSize,
        },
      });
    }
  }, [currentUser, paginationState]);

  useEffect(() => {
    if (feedRes.data)
      feedVar({
        items: feedRes.data.homeFeed.pagedItems,
        totalItems: feedRes.data.homeFeed.totalItems,
        loading: feedRes.loading,
      });

    return () => {
      feedVar(null);
    };
  }, [feedRes.data]);

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
        totalItems: feed.totalItems - 1,
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
        totalItems: feed.totalItems - 1,
      });
  };

  return (
    <>
      <WelcomeCard isLoggedIn={!!currentUser} />

      {currentUser && <PostForm posts={feed?.items} />}

      <PageButtons />
      <Feed deletePost={deletePostHandler} deleteMotion={deleteMotionHandler} />
      <PageButtons />
    </>
  );
};

export default Home;
