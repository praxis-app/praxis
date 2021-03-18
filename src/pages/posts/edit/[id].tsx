import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Spinner } from "react-bootstrap";
import { useRouter } from "next/router";

import PostForm from "../../../components/Posts/Form";
import { POST } from "../../../apollo/client/queries";

const Edit = () => {
  const { query } = useRouter();
  const [post, setPost] = useState(null);

  const { data } = useQuery(POST, {
    variables: { id: query.id },
  });

  useEffect(() => {
    setPost(data ? data.post : data);
  }, [data]);

  if (post) return <PostForm post={post} isEditing={true} />;
  return <Spinner animation="border" />;
};

export default Edit;
