import { useEffect } from "react";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";

import PostForm from "../components/Posts/Form";
import Feed from "../components/Shared/Feed";
import { HOME_FEED } from "../apollo/client/queries";
import { DELETE_POST, DELETE_MOTION } from "../apollo/client/mutations";
import { isLoggedIn } from "../utils/auth";
import WelcomeCard from "../components/About/Welcome";
import { Common } from "../constants";
import { feedItemsVar } from "../apollo/client/localState";
import { useCurrentUser } from "../hooks";

const Home = () => {
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedItemsVar);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);
  const feedRes = useQuery(HOME_FEED, {
    variables: {
      userId: currentUser?.id,
    },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (feedRes.data) feedItemsVar(feedRes.data.homeFeed);
    return () => {
      feedItemsVar([]);
    };
  }, [feedRes.data]);

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

  return (
    <>
      <WelcomeCard isLoggedIn={isLoggedIn(currentUser)} />

      {isLoggedIn(currentUser) && (
        <PostForm posts={feed} setPosts={feedItemsVar} />
      )}

      <Feed
        deletePost={deletePostHandler}
        deleteMotion={deleteMotionHandler}
        loading={feedRes.loading}
      />
    </>
  );
};

export default Home;
