import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Spinner } from "react-bootstrap";
import { useRouter } from "next/router";

import CommentForm from "../../../components/Comments/Form";
import { COMMENT } from "../../../apollo/client/queries";

const Edit = () => {
  const { query } = useRouter();
  const [comment, setComment] = useState(null);

  const { data } = useQuery(COMMENT, {
    variables: { id: query.id ? query.id : 0 },
  });

  useEffect(() => {
    setComment(data ? data.comment : data);
  }, [data]);

  if (comment) return <CommentForm comment={comment} isEditing={true} />;
  return <Spinner animation="border" />;
};

export default Edit;
