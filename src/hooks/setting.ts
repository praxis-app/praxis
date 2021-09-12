import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { SETTINGS_BY_GROUP_ID } from "../apollo/client/queries";
import { noCache } from "../utils/apollo";

export const useSettingsByGroupId = (
  groupId: string | undefined,
  callDep?: any
): [ClientSetting[], (settings: ClientSetting[]) => void, boolean] => {
  const [settings, setSettings] = useState<ClientSetting[]>([]);
  const [getSettingsRes, settingsRes] = useLazyQuery(
    SETTINGS_BY_GROUP_ID,
    noCache
  );

  useEffect(() => {
    if (groupId)
      getSettingsRes({
        variables: {
          groupId,
        },
      });
  }, [groupId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (settingsRes.data) setSettings(settingsRes.data.settingsByGroupId);
  }, [settingsRes.data]);

  return [settings, setSettings, settingsRes.loading];
};
