import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Typography, CircularProgress } from "@material-ui/core";

import Messages from "../../../utils/messages";
import { ResourcePaths } from "../../../constants/common";
import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import { useCurrentUser, useSettingsByGroupId } from "../../../hooks";
import { GroupSettings, SettingStates } from "../../../constants/setting";
import SettingsFormWithCard from "../../../components/Settings/FormWithCard";

const Settings = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<ClientGroup>();
  const [groupSettings, setGroupSettings, groupSettingsLoading] =
    useSettingsByGroupId(group?.id);
  const [unsavedSettings, setUnsavedSettings] = useState<ClientSetting[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);

  useEffect(() => {
    if (query.name)
      getGroupRes({
        variables: { name: query.name },
      });
  }, [query.name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const anyUnsavedSettings = (): boolean => {
    return (
      Boolean(unsavedSettings.length) &&
      JSON.stringify(groupSettings) !== JSON.stringify(unsavedSettings)
    );
  };

  const isNoAdmin = (): boolean => {
    return (
      !anyUnsavedSettings() &&
      settingByName(GroupSettings.NoAdmin) === SettingStates.On
    );
  };

  const ownGroup = (): boolean => {
    if (!currentUser) return false;
    return group?.creatorId === currentUser.id;
  };

  if (groupRes.loading || groupSettingsLoading) return <CircularProgress />;
  if (isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;
  if (!ownGroup()) return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      <Link href={`${ResourcePaths.Group}${query.name}`}>
        <a>
          <Typography variant="h3" color="primary">
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6" style={{ marginBottom: 24 }}>
        {Messages.groups.settings.nameWithGroup()}
      </Typography>

      <SettingsFormWithCard
        settings={groupSettings}
        setSettings={setGroupSettings}
        unsavedSettings={unsavedSettings}
        setUnsavedSettings={setUnsavedSettings}
        anyUnsavedSettings={anyUnsavedSettings()}
      />
    </>
  );
};

export default Settings;
