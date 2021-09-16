import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CircularProgress, Typography } from "@material-ui/core";
import { truncate } from "lodash";

import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import Member from "../../../components/Groups/Member";
import Messages from "../../../utils/messages";
import { useMembersByGroupId } from "../../../hooks";
import { TruncationSizes } from "../../../constants/common";

const Members = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<ClientGroup>();
  const [groupMembers, _, groupMembersLoading] = useMembersByGroupId(group?.id);
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

  if (!query.name || groupRes.loading || groupMembersLoading)
    return <CircularProgress />;

  return (
    <>
      <Link href={`/groups/${query.name}`}>
        <a>
          <Typography variant="h3" color="primary">
            {truncate(query.name as string, {
              length: TruncationSizes.Medium,
            })}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6" color="primary">
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
