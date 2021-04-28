import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";

import {
  CURRENT_USER,
  GROUP_BY_NAME,
  SETTINGS_BY_GROUP_ID,
} from "../../../apollo/client/queries";
import SettingsForm from "../../../components/Settings/Form";
import { Settings as SettingsConstants } from "../../../constants";

const Settings = () => {
  const { query } = useRouter();
  const [group, setGroup] = useState<Group>();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [unsavedSettings, setUnsavedSettings] = useState<Setting[]>([]);
  const currentUserRes = useQuery(CURRENT_USER);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME);
  const [getSettingsRes, settingsRes] = useLazyQuery(SETTINGS_BY_GROUP_ID, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (query.name)
      getGroupRes({
        variables: { name: query.name },
      });
  }, [query.name]);

  useEffect(() => {
    if (group)
      getSettingsRes({
        variables: { groupId: group.id },
      });
  }, [group]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (settingsRes.data) setSettings(settingsRes.data.settingsByGroupId);
  }, [settingsRes.data]);

  const settingByName = (name: string): string => {
    const setting = settings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const anyUnsavedSettings = (): boolean => {
    return (
      !!unsavedSettings.length &&
      JSON.stringify(settings) !== JSON.stringify(unsavedSettings)
    );
  };

  const isNoAdmin = (): boolean => {
    return (
      !anyUnsavedSettings() &&
      settingByName(SettingsConstants.GroupSettings.NoAdmin) ===
        SettingsConstants.States.On
    );
  };

  if (isNoAdmin())
    return (
      <>
        This group has been irriversibly set to no-admin — All changes to
        settings must now be made via motion ratification.
      </>
    );

  if (currentUser)
    return (
      <>
        <Link href={`/groups/${query.name}`}>
          <a>
            <h1 style={{ color: "white" }}>{query.name}</h1>
          </a>
        </Link>

        <h5 style={{ color: "white" }}>Group Settings</h5>

        <SettingsForm
          settings={settings}
          setSettings={setSettings}
          unsavedSettings={unsavedSettings}
          setUnsavedSettings={setUnsavedSettings}
          anyUnsavedSettings={anyUnsavedSettings()}
        />
      </>
    );

  return <></>;
};

export default Settings;
