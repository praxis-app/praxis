import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, createStyles, makeStyles } from "@material-ui/core";

import { GROUP_BY_NAME, GROUP_MEMBERS } from "../../../apollo/client/queries";
import styles from "../../../styles/Group/Group.module.scss";
import Member from "../../../components/Groups/Member";
import Messages from "../../../utils/messages";
const useStyles = makeStyles(() =>
  createStyles({
    root: {
      backgroundColor: "rgb(65, 65, 65)",
    },
  })
);

const Members = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<Group>();
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const [getGroupMembersRes, groupMembersRes] = useLazyQuery(GROUP_MEMBERS, {
    fetchPolicy: "no-cache",
  });
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
      getGroupMembersRes({
        variables: { groupId: group.id },
      });
    }
  }, [group]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (groupMembersRes.data)
      setGroupMembers(groupMembersRes.data.groupMembers);
  }, [groupMembersRes.data]);

  return (
    <>
      <Link href={`/groups/${query.name}`}>
        <a>
          <h1 style={{ color: "white" }}>{query.name}</h1>
        </a>
      </Link>

      <h5 style={{ color: "white" }}>
        {Messages.groups.members(groupMembers.length)}
      </h5>

      <Card className={classes.root + " " + styles.card}>
        {groupMembers.map(({ userId }: GroupMember) => {
          return <Member userId={userId} key={userId} />;
        })}
      </Card>
    </>
  );
};

export default Members;
