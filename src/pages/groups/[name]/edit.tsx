import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import GroupForm from "../../../components/Groups/Form";
import { noCache } from "../../../utils/apollo";
import Messages from "../../../utils/messages";
import { useCurrentUser, useSettingsByGroupId } from "../../../hooks";
import { GroupSettings, SettingStates } from "../../../constants/setting";

const Edit = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<Group>();
  const [groupSettings, _, groupSettingsLoading] = useSettingsByGroupId(
    group?.id
  );
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME, noCache);

  useEffect(() => {
    if (query.name) {
      getGroupRes({
        variables: { name: query.name },
      });
    }
  }, [query.name]);

  useEffect(() => {
    setGroup(groupRes.data ? groupRes.data.groupByName : groupRes.data);
  }, [groupRes.data]);

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
    return settingByName(GroupSettings.NoAdmin) === SettingStates.On;
  };

  const ownGroup = (): boolean => {
    if (!currentUser) return false;
    return group?.creatorId === currentUser.id;
  };

  if (groupRes.loading || groupSettingsLoading) return <CircularProgress />;
  if (currentUser && isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;
  if (!ownGroup()) return <>{Messages.users.permissionDenied()}</>;

  return <GroupForm group={group} isEditing={true} />;
};

export default Edit;
