import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GROUP_MEMBERS } from "../apollo/client/queries";
import { noCache } from "../utils/apollo";

export const useMembersByGroupId = (
  groupId: string | undefined,
  callDep?: any
): [GroupMember[], (members: GroupMember[]) => void, boolean] => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [getMembersRes, membersRes] = useLazyQuery(GROUP_MEMBERS, noCache);

  useEffect(() => {
    if (groupId)
      getMembersRes({
        variables: {
          groupId,
        },
      });
  }, [groupId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (membersRes.data) setMembers(membersRes.data.groupMembers);
  }, [membersRes.data]);

  return [members, setMembers, !membersRes.data];
};
