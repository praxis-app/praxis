import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { Spinner } from "react-bootstrap";

import User from "../../components/Users/User";
import PostsList from "../../components/Posts/List";
import { USER_BY_NAME, POSTS } from "../../apollo/client/queries";
import { DELETE_USER, DELETE_POST } from "../../apollo/client/mutations";

const Show = () => {
  const { query } = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const userRes = useQuery(USER_BY_NAME, {
    variables: { name: query.name ? query.name : "" },
  });
  const postsRes = useQuery(POSTS);
  const [deleteUser] = useMutation(DELETE_USER);
  const [deletePost] = useMutation(DELETE_POST);

  useEffect(() => {
    setUser(userRes.data ? userRes.data.userByName : userRes.data);
  }, [userRes.data]);

  useEffect(() => {
    if (user && postsRes.data) {
      setPosts(
        postsRes.data.allPosts.filter(
          (post: Post) => post.userId === parseInt(user.id)
        )
      );
    }
  }, [postsRes.data, user]);

  const deleteUserHandler = async (userId) => {
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
        <Spinner animation="border" />
      )}
    </>
  );
};

export default Show;
