import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Spinner } from "react-bootstrap";
import Router, { useRouter } from "next/router";

import { POST } from "../../apollo/client/queries";
import { DELETE_POST } from "../../apollo/client/mutations";
import Post from "../../components/Posts/Post";

const Show = () => {
  const { query } = useRouter();
  const [post, setPost] = useState(null);
  const [deletePost] = useMutation(DELETE_POST);

  const { data } = useQuery(POST, {
    variables: { id: query.id ? query.id : 0 },
  });

  useEffect(() => {
    setPost(data ? data.post : data);
  }, [data]);

  const deletePostHandler = async (id: string) => {
    try {
      await deletePost({
        variables: {
          id,
        },
      });
      Router.push("/");
    } catch {}
  };

  if (post) return <Post post={post} deletePost={deletePostHandler} />;
  return <Spinner animation="border" />;
};

export default Show;
