import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, createStyles, makeStyles, Theme } from "@material-ui/core";

import {
  GROUP_BY_NAME,
  MEMBER_REUQESTS,
  CURRENT_USER,
} from "../../../apollo/client/queries";
import styles from "../../../styles/Group/Group.module.scss";
import Request from "../../../components/Groups/Request";
import { isLoggedIn } from "../../../utils/auth";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: "rgb(65, 65, 65)",
    },
  })
);

const Requests = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<Group>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const currentUserRes = useQuery(CURRENT_USER);
  const [getMemberRequestsRes, memberRequestsRes] = useLazyQuery(
    MEMBER_REUQESTS,
    {
      fetchPolicy: "no-cache",
    }
  );
  const classes = useStyles();

  useEffect(() => {
    if (query.name) {
      getGroupRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    if (group) {
      getMemberRequestsRes({
        variables: { groupId: group.id },
      });
    }
  }, [group]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (memberRequestsRes.data)
      setMemberRequests(memberRequestsRes.data.memberRequests);
  }, [memberRequestsRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const isCreator = (): boolean => {
    if (isLoggedIn(currentUser) && group)
      return currentUser?.id === group.creatorId;
    return false;
  };

  if (!isCreator()) return <></>;
  return (
    <>
      <Link href={`/groups/${query.name}`}>
        <a>
          <h1 style={{ color: "white" }}>{query.name}</h1>
        </a>
      </Link>

      <h5 style={{ color: "white" }}>
        {memberRequests.length} Member Requests
      </h5>

      <Card className={classes.root + " " + styles.card}>
        {memberRequests.map((memberRequest: MemberRequest) => {
          return (
            <Request
              memberRequest={memberRequest}
              memberRequests={memberRequests}
              setMemberRequests={setMemberRequests}
              key={memberRequest.userId}
            />
          );
        })}
      </Card>
    </>
  );
};

export default Requests;
