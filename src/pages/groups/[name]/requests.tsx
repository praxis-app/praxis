import React, { useState, useEffect } from "react";
import {
  LazyQueryHookOptions,
  OperationVariables,
  useLazyQuery,
  useQuery,
} from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, createStyles, makeStyles } from "@material-ui/core";

import {
  GROUP_BY_NAME,
  MEMBER_REUQESTS,
  GROUP_MEMBERS,
  SETTINGS_BY_GROUP_ID,
  CURRENT_USER,
} from "../../../apollo/client/queries";
import styles from "../../../styles/Group/Group.module.scss";
import Request from "../../../components/Groups/Request";
import { isLoggedIn } from "../../../utils/auth";
import { Settings } from "../../../constants";

const useStyles = makeStyles(() =>
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
  const [groupSettings, setGroupSettings] = useState<Setting[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const currentUserRes = useQuery(CURRENT_USER);
  const noCache: LazyQueryHookOptions<any, OperationVariables> = {
    fetchPolicy: "no-cache",
  };
  const [getMemberRequestsRes, memberRequestsRes] = useLazyQuery(
    MEMBER_REUQESTS,
    noCache
  );
  const [getGroupMembersRes, groupMembersRes] = useLazyQuery(
    GROUP_MEMBERS,
    noCache
  );
  const [getGroupSettingsRes, groupSettingsRes] = useLazyQuery(
    SETTINGS_BY_GROUP_ID,
    noCache
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
      const variables = {
        variables: { groupId: group.id },
      };
      getMemberRequestsRes(variables);
      getGroupMembersRes(variables);
      getGroupSettingsRes(variables);
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
    if (groupMembersRes.data)
      setGroupMembers(groupMembersRes.data.groupMembers);
  }, [groupMembersRes.data]);

  useEffect(() => {
    if (groupSettingsRes.data)
      setGroupSettings(groupSettingsRes.data.settingsByGroupId);
  }, [groupSettingsRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const isCreator = (): boolean => {
    if (isLoggedIn(currentUser) && group)
      return currentUser?.id === group.creatorId;
    return false;
  };

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const isNoAdmin = (): boolean => {
    return settingByName(Settings.GroupSettings.NoAdmin) === Settings.States.On;
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

  return <></>;
};

export default Requests;
