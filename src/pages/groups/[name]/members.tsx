import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Typography } from "@material-ui/core";

import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import Member from "../../../components/Groups/Member";
import Messages from "../../../utils/messages";
import { useMembersByGroupId } from "../../../hooks";

const Members = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<ClientGroup>();
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);

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
          <Typography variant="h3" color="primary">
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6">
        {Messages.groups.members(groupMembers.length)}
      </Typography>

      <Card>
        {groupMembers.map(({ userId }: ClientGroupMember) => {
          return <Member userId={userId} key={userId} />;
        })}
      </Card>
    </>
  );
};

export default Members;
