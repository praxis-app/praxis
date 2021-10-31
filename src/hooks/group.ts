import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GROUP, GROUP_BY_NAME, GROUP_MEMBERS } from "../apollo/client/queries";
import { noCache } from "../utils/apollo";

export const useGroupById = (
  id: string | string[] | undefined,
  callDep?: any
): [ClientGroup | undefined, (group: ClientGroup) => void, boolean] => {
  const [group, setGroup] = useState<ClientGroup>();
  const [getGroupRes, groupRes] = useLazyQuery(GROUP, noCache);

  useEffect(() => {
    if (id)
      getGroupRes({
        variables: {
          id,
        },
      });
  }, [id, JSON.stringify(callDep)]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.group);
  }, [groupRes.data]);

  return [group, setGroup, groupRes.loading];
};

export const useGroupByName = (
  name: string | string[] | undefined,
  callDep?: any
): [ClientGroup | undefined, (group: ClientGroup) => void, boolean] => {
  const [group, setGroup] = useState<ClientGroup>();
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME, noCache);

  useEffect(() => {
    if (name)
      getGroupRes({
        variables: {
          name,
        },
      });
  }, [name, JSON.stringify(callDep)]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  return [group, setGroup, groupRes.loading];
};

export const useMembersByGroupId = (
  groupId: string | undefined,
  callDep?: any
): [ClientGroupMember[], (members: ClientGroupMember[]) => void, boolean] => {
  const [members, setMembers] = useState<ClientGroupMember[]>([]);
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

  return [members, setMembers, membersRes.loading];
};
