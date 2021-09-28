import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Typography, CircularProgress } from "@material-ui/core";

import Messages from "../../../utils/messages";
import { ResourcePaths, TypeNames } from "../../../constants/common";
import {
  useGroupByName,
  useHasPermissionByGroupId,
  useSettingsByGroupId,
} from "../../../hooks";
import { GroupSettings, SettingStates } from "../../../constants/setting";
import SettingsForm from "../../../components/Settings/Form";
import { settingValue } from "../../../utils/setting";
import { GroupPermissions } from "../../../constants/role";

const Settings = () => {
  const { query } = useRouter();
  const [group, _, groupLoading] = useGroupByName(query.name);
  const [groupSettings, setGroupSettings, groupSettingsLoading] =
    useSettingsByGroupId(group?.id);
  const [unsavedSettings, setUnsavedSettings] = useState<ClientSetting[]>([]);
  const [canManageSettings, canManageSettingsLoading] =
    useHasPermissionByGroupId(GroupPermissions.ManageSettings, group?.id);

  const anyUnsavedSettings = (): boolean => {
    return (
      Boolean(unsavedSettings.length) &&
      JSON.stringify(groupSettings) !== JSON.stringify(unsavedSettings)
    );
  };

  const isNoAdmin = (): boolean => {
    return (
      !anyUnsavedSettings() &&
      settingValue(GroupSettings.NoAdmin, groupSettings) === SettingStates.On
    );
  };

  if (groupLoading || groupSettingsLoading || canManageSettingsLoading)
    return <CircularProgress />;
  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;
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
