import { useState, useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import User from "../../components/Users/User";
import PostsList from "../../components/Posts/List";
import { USER_BY_NAME, POSTS_BY_USER_NAME } from "../../apollo/client/queries";
import { DELETE_USER, DELETE_POST } from "../../apollo/client/mutations";

const Show = () => {
  const { query } = useRouter();
  const [user, setUser] = useState<User>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME);
  const [getPostsRes, postsRes] = useLazyQuery(POSTS_BY_USER_NAME, {
    fetchPolicy: "no-cache",
  });
  const [deleteUser] = useMutation(DELETE_USER);
  const [deletePost] = useMutation(DELETE_POST);

  useEffect(() => {
    const vars = {
      variables: { name: query.name },
    };
    if (query.name) {
      getUserRes(vars);
      getPostsRes(vars);
    }
  }, [query.name]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.userByName);
  }, [userRes.data]);

  useEffect(() => {
    if (postsRes.data) setPosts(postsRes.data.postsByUserName);
  }, [postsRes.data]);

  const deleteUserHandler = async (userId: string) => {
    try {
      await deleteUser({
        variables: {
          id: userId,
        },
      });
      Router.push("/users");
    } catch {}
  };

  const deletePostHandler = async (id: string) => {
    try {
      await deletePost({
        variables: {
          id: id,
        },
      });
      // Removes deleted post from state
      setPosts(posts.filter((post: Post) => post.id !== id));
    } catch {}
  };

  return (
    <>
      {user ? (
        <>
          <User user={user} deleteUser={deleteUserHandler} />
          <PostsList posts={posts} deletePost={deletePostHandler} />
        </>
      ) : (
        <CircularProgress style={{ color: "white" }} />
      )}
    </>
  );
};

export default Show;
