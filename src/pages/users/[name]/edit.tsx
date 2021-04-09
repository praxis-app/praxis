import React, { useState, useEffect } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { Spinner } from "react-bootstrap";
import { useRouter } from "next/router";

import UserForm from "../../../components/Users/Form";
import { USER_BY_NAME } from "../../../apollo/client/queries";

const Edit = () => {
  const { query } = useRouter();
  const [user, setUser] = useState<User>();
  const [getUserRes, userRes] = useLazyQuery(USER_BY_NAME);

  useEffect(() => {
    if (query.name) {
      getUserRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    setUser(userRes.data ? userRes.data.userByName : userRes.data);
  }, [userRes.data]);

  return (
    <>
      {user ? (
        <UserForm user={user} isEditing={true} />
      ) : (
        <Spinner animation="border" />
      )}
    </>
  );
};

export default Edit;
