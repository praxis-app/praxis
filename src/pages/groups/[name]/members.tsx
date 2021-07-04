import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, createStyles, makeStyles, Typography } from "@material-ui/core";

import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import styles from "../../../styles/Group/Group.module.scss";
import Member from "../../../components/Groups/Member";
import Messages from "../../../utils/messages";
import { useMembersByGroupId } from "../../../hooks";
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
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const classes = useStyles();

  useEffect(() => {
    if (query.name) {
      getGroupRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  return (
    <>
      <Link href={`/groups/${query.name}`}>
        <a>
          <Typography variant="h3" style={{ fontSize: 40 }}>
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6" style={{ marginBottom: 6, color: "white" }}>
        {Messages.groups.members(groupMembers.length)}
      </Typography>

      <Card className={classes.root + " " + styles.card}>
        {groupMembers.map(({ userId }: GroupMember) => {
          return <Member userId={userId} key={userId} />;
        })}
      </Card>
    </>
  );
};

export default Members;
