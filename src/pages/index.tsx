import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";

import PostForm from "../components/Posts/Form";
import Feed from "../components/Shared/Feed";
import { POSTS, CURRENT_USER, HOME_FEED } from "../apollo/client/queries";
import { DELETE_POST, DELETE_MOTION } from "../apollo/client/mutations";
import { isLoggedIn } from "../utils/auth";
import WelcomeCard from "../components/About/Welcome";

const Home = () => {
  const [feed, setFeed] = useState<FeedItem[]>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);
  const postsRes = useQuery(POSTS, {
    fetchPolicy: "no-cache",
  });
  const feedRes = useQuery(HOME_FEED, {
    variables: {
      userId: currentUser?.id,
    },
    fetchPolicy: "no-cache",
  });
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (postsRes.data) {
      setFeed(postsRes.data.allPosts);
    }
    if (feedRes.data) {
      setFeed(feedRes.data.homeFeed);
    }
  }, [postsRes.data, feedRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const deletePostHandler = async (id: string) => {
    try {
      await deletePost({
        variables: {
          id,
        },
      });
      if (feed)
        setFeed(
          feed.filter(
            (post: FeedItem) => post.id !== id || post.__typename !== "Post"
          )
        );
    } catch {}
  };

  const deleteMotionHandler = async (id: string) => {
    try {
      await deleteMotion({
        variables: {
          id,
        },
      });
      if (feed)
        setFeed(
          feed.filter(
            (motion: FeedItem) =>
              motion.id !== id || motion.__typename !== "Motion"
          )
        );
    } catch {}
  };

  return (
    <>
      <WelcomeCard isLoggedIn={isLoggedIn(currentUser)} />

      {isLoggedIn(currentUser) && <PostForm posts={feed} setPosts={setFeed} />}

      {feed && (
        <Feed
          feed={feed}
          deletePost={deletePostHandler}
          deleteMotion={deleteMotionHandler}
        />
      )}
    </>
  );
};

export default Home;
