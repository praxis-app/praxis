import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";

import PostForm from "../components/Posts/Form";
import PostList from "../components/Posts/List";
import { POSTS, CURRENT_USER } from "../apollo/client/queries";
import { DELETE_POST } from "../apollo/client/mutations";

const Home = () => {
  const [posts, setPosts] = useState<Post[]>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [deletePost] = useMutation(DELETE_POST);
  const postsRes = useQuery(POSTS, {
    fetchPolicy: "no-cache",
  });
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (postsRes.data) setPosts(postsRes.data.allPosts);
  }, [postsRes.data]);

  useEffect(() => {
    if (currentUserRes.data)
      setCurrentUser(currentUserRes.data.user.isAuthenticated);
  }, [currentUserRes.data]);

  const deletePostHandler = async (id: string) => {
    try {
      await deletePost({
        variables: {
          id,
        },
      });
      if (posts) setPosts(posts.filter((post: Post) => post.id !== id));
    } catch {}
  };

  return (
    <>
      {currentUser && <PostForm posts={posts} setPosts={setPosts} />}
      {posts && <PostList posts={posts} deletePost={deletePostHandler} />}
    </>
  );
};

export default Home;
