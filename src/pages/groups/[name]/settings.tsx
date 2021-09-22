import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { Typography, CircularProgress } from "@material-ui/core";

import Messages from "../../../utils/messages";
import { ResourcePaths } from "../../../constants/common";
import { GROUP_BY_NAME } from "../../../apollo/client/queries";
import {
  useHasPermissionByGroupId,
  useSettingsByGroupId,
} from "../../../hooks";
import { GroupSettings, SettingStates } from "../../../constants/setting";
import SettingsForm from "../../../components/Settings/Form";
import { settingValueByName } from "../../../utils/setting";
import { GroupPermissions } from "../../../constants/role";

const Settings = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<ClientGroup>();
  const [groupSettings, setGroupSettings, groupSettingsLoading] =
    useSettingsByGroupId(group?.id);
  const [unsavedSettings, setUnsavedSettings] = useState<ClientSetting[]>([]);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const [canManageSettings, canManageSettingsLoading] =
    useHasPermissionByGroupId(GroupPermissions.ManageSettings, group?.id);

  useEffect(() => {
    if (query.name)
      getGroupRes({
        variables: { name: query.name },
      });
  }, [query.name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  const anyUnsavedSettings = (): boolean => {
    return (
      Boolean(unsavedSettings.length) &&
      JSON.stringify(groupSettings) !== JSON.stringify(unsavedSettings)
    );
  };

  const isNoAdmin = (): boolean => {
    return (
      !anyUnsavedSettings() &&
      settingValueByName(GroupSettings.NoAdmin, groupSettings) ===
        SettingStates.On
    );
  };

  if (groupRes.loading || groupSettingsLoading || canManageSettingsLoading)
    return <CircularProgress />;
  if (isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;
  if (!canManageSettings) return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      <Link href={`${ResourcePaths.Group}${query.name}`}>
        <a>
          <Typography variant="h3" color="primary">
            {query.name}
          </Typography>
        </a>
      </Link>

      <Typography variant="h6" color="primary" style={{ marginBottom: 24 }}>
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
