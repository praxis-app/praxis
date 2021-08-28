import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Typography } from "@material-ui/core";

import { GROUP_BY_NAME, MEMBER_REUQESTS } from "../../../apollo/client/queries";
import Request from "../../../components/Groups/Request";
import { ResourcePaths } from "../../../constants/common";
import { GroupSettings, SettingStates } from "../../../constants/setting";
import Messages from "../../../utils/messages";
import { noCache } from "../../../utils/apollo";
import {
  useCurrentUser,
  useMembersByGroupId,
  useSettingsByGroupId,
} from "../../../hooks";

const Requests = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<Group>();
  const [groupSettings] = useSettingsByGroupId(group?.id);
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const [getMemberRequestsRes, memberRequestsRes] = useLazyQuery(
    MEMBER_REUQESTS,
    noCache
  );

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

  const isCreator = (): boolean => {
    if (currentUser && group) return currentUser.id === group.creatorId;
    return false;
  };

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const isNoAdmin = (): boolean => {
    return settingByName(GroupSettings.NoAdmin) === SettingStates.On;
  };

  const isAMember = (): boolean => {
    const member = groupMembers?.find(
      (member: GroupMember) => member.userId === currentUser?.id
    );
    return !!member;
  };

  const canSeeRequests = (): boolean => {
    if (isCreator()) return true;
    if (isNoAdmin() && isAMember()) return true;
    return false;
  };

  if (canSeeRequests())
    return (
      <>
        <Link href={`${ResourcePaths.Group}${query.name}`}>
          <a>
            <Typography variant="h3" color="primary">
              {query.name}
            </Typography>
          </a>
        </Link>

        <Typography variant="h6">
          {Messages.groups.memberRequests(memberRequests.length)}
        </Typography>

        <Card>
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

  return null;
};

export default Requests;
