import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import GroupForm from "../../../components/Groups/Form";
import { GROUP_BY_NAME, CURRENT_USER } from "../../../apollo/client/queries";
import { isLoggedIn } from "../../../utils/auth";

const Edit = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<Group>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const currentUserRes = useQuery(CURRENT_USER);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (query.name) {
      getGroupRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    setGroup(groupRes.data ? groupRes.data.groupByName : groupRes.data);
  }, [groupRes.data]);

  if (isLoggedIn(currentUser) && group?.creatorId !== currentUser?.id)
    return <></>;

  return (
    <>
      {group ? (
        <GroupForm group={group} isEditing={true} />
      ) : (
        <CircularProgress style={{ color: "white" }} />
      )}
    </>
  );
};

export default Edit;
