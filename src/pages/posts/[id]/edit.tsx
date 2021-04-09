import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { Spinner } from "react-bootstrap";
import { useRouter } from "next/router";

import PostForm from "../../../components/Posts/Form";
import { POST } from "../../../apollo/client/queries";

const Edit = () => {
  const { query } = useRouter();
  const [post, setPost] = useState<Post>();

  const [getPostRes, postRes] = useLazyQuery(POST);

  useEffect(() => {
    if (query.id)
      getPostRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    setPost(postRes.data ? postRes.data.post : postRes.data);
  }, [postRes.data]);

  if (post) return <PostForm post={post} isEditing={true} />;
  return <Spinner animation="border" />;
};

export default Edit;
