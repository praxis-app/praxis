import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import {
  GROUP_BY_NAME,
  CURRENT_USER,
  SETTINGS_BY_GROUP_ID,
} from "../../../apollo/client/queries";
import { isLoggedIn } from "../../../utils/auth";
import GroupForm from "../../../components/Groups/Form";
import { Settings } from "../../../constants";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";

const Edit = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<Group>();
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [groupSettings, setGroupSettings] = useState<Setting[]>([]);
  const currentUserRes = useQuery(CURRENT_USER);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME, noCache);
  const [getGroupSettingsRes, groupSettingsRes] = useLazyQuery(
    SETTINGS_BY_GROUP_ID,
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
      getGroupSettingsRes({
        variables: { groupId: group.id },
      });
    }
  }, [group]);

  useEffect(() => {
    setGroup(groupRes.data ? groupRes.data.groupByName : groupRes.data);
  }, [groupRes.data]);

  useEffect(() => {
    if (groupSettingsRes.data)
      setGroupSettings(groupSettingsRes.data.settingsByGroupId);
  }, [groupSettingsRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (currentUser && group && !ownGroup()) {
      Router.push("/");
    }
  }, [currentUser, group]);

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const isNoAdmin = (): boolean => {
    return settingByName(Settings.GroupSettings.NoAdmin) === Settings.States.On;
  };

  const ownGroup = (): boolean => {
    return group?.creatorId === currentUser?.id;
  };

  if (isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;

  if (isLoggedIn(currentUser) && !ownGroup())
    return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      {group ? (
        <GroupForm group={group} isEditing={true} />
      ) : (
        <CircularProgress style={{ color: "white" }} />
      )}
    </>
  );
};

export default Edit;
