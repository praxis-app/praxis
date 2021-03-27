import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";

import PostForm from "../components/Posts/Form";
import PostList from "../components/Posts/List";
import { POSTS, CURRENT_USER } from "../apollo/client/queries";
import { DELETE_POST } from "../apollo/client/mutations";

const Home = () => {
  const [posts, setPosts] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deletePost] = useMutation(DELETE_POST);
  const postsRes = useQuery(POSTS, {
    fetchPolicy: "no-cache",
  });
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    setPosts(postsRes.data ? postsRes.data.allPosts : postsRes.data);
  }, [postsRes.data]);

  useEffect(() => {
    setCurrentUser(
      currentUserRes.data
        ? currentUserRes.data.user.isAuthenticated
        : currentUserRes.data
    );
  }, [currentUserRes.data]);

  const deletePostHandler = async (id: string) => {
    try {
      await deletePost({
        variables: {
          id,
        },
      });
      setPosts(posts.filter((post: Post) => post.id !== id));
    } catch {}
  };

  return (
    <>
      {currentUser && <PostForm posts={posts} setPosts={setPosts} />}
      <PostList posts={posts} deletePost={deletePostHandler} />
    </>
  );
};

export default Home;
