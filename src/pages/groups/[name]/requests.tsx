import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CircularProgress, Typography } from "@material-ui/core";
import { truncate } from "lodash";

import { GROUP_BY_NAME, MEMBER_REUQESTS } from "../../../apollo/client/queries";
import Request from "../../../components/Groups/Request";
import { ResourcePaths, TruncationSizes } from "../../../constants/common";
import { GroupSettings, SettingStates } from "../../../constants/setting";
import Messages from "../../../utils/messages";
import {
  useCurrentUser,
  useMembersByGroupId,
  useSettingsByGroupId,
} from "../../../hooks";
import { noCache, settingValueByName } from "../../../utils/clientIndex";

const Requests = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<ClientGroup>();
  const [groupSettings, _setSettings, groupSettingsLoading] =
    useSettingsByGroupId(group?.id);
  const [groupMembers, _setMembers, groupMembersLoading] = useMembersByGroupId(
    group?.id
  );
  const [memberRequests, setMemberRequests] = useState<ClientMemberRequest[]>(
    []
  );
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

  const isNoAdmin = (): boolean => {
    return (
      settingValueByName(GroupSettings.NoAdmin, groupSettings) ===
      SettingStates.On
    );
  };

  const isAMember = (): boolean => {
    const member = groupMembers?.find(
      (member: ClientGroupMember) => member.userId === currentUser?.id
    );
    return Boolean(member);
  };

  const canSeeRequests = (): boolean => {
    if (isCreator()) return true;
    if (isNoAdmin() && isAMember()) return true;
    return false;
  };

  if (
    !query.name ||
    groupRes.loading ||
    memberRequestsRes.loading ||
    groupMembersLoading ||
    groupSettingsLoading
  )
    return <CircularProgress />;

  if (canSeeRequests())
    return (
      <>
        <Link href={`${ResourcePaths.Group}${query.name}`}>
          <a>
            <Typography variant="h3" color="primary">
              {truncate(query.name as string, {
                length: TruncationSizes.Medium,
              })}
            </Typography>
          </a>
        </Link>

        <Typography variant="h6" color="primary">
          {Messages.groups.memberRequests(memberRequests.length)}
        </Typography>

        <Card>
          {memberRequests.map((memberRequest: ClientMemberRequest) => {
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
