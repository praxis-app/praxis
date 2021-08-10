import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Typography } from "@material-ui/core";

import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import SettingsForm from "../../../components/Settings/Form";
import { Common, Settings as SettingsConstants } from "../../../constants";
import Messages from "../../../utils/messages";
import { useCurrentUser, useSettingsByGroupId } from "../../../hooks";

const Settings = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<Group>();
  const [groupSettings, setGroupSettings] = useSettingsByGroupId(group?.id);
  const [unsavedSettings, setUnsavedSettings] = useState<Setting[]>([]);
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
      !!unsavedSettings.length &&
      JSON.stringify(groupSettings) !== JSON.stringify(unsavedSettings)
    );
  };

  const isNoAdmin = (): boolean => {
    return (
      !anyUnsavedSettings() &&
      settingByName(SettingsConstants.GroupSettings.NoAdmin) ===
        SettingsConstants.States.On
    );
  };

  const ownGroup = (): boolean => {
    if (!currentUser) return false;
    return group?.creatorId === currentUser.id;
  };

  if (isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;

  if (!ownGroup()) return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      <Link href={`${Common.ResourcePaths.Group}${query.name}`}>
        <a>
          <Typography variant="h3" color="primary">
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6">
        {Messages.groups.settings.nameWithGroup()}
      </Typography>

      <SettingsForm
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
