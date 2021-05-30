import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import Router, { useRouter } from "next/router";
import Link from "next/link";

import {
  GROUP_BY_NAME,
  SETTINGS_BY_GROUP_ID,
} from "../../../apollo/client/queries";
import SettingsForm from "../../../components/Settings/Form";
import { Settings as SettingsConstants } from "../../../constants";
import Messages from "../../../utils/messages";
import { isLoggedIn } from "../../../utils/auth";
import { useCurrentUser } from "../../../hooks";

const Settings = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [group, setGroup] = useState<Group>();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [unsavedSettings, setUnsavedSettings] = useState<Setting[]>([]);
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
    if (settingsRes.data) setSettings(settingsRes.data.settingsByGroupId);
  }, [settingsRes.data]);

  useEffect(() => {
    if (currentUser && group && isLoggedIn(currentUser) && !ownGroup()) {
      Router.push("/");
    }
  }, [currentUser, group]);

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

  const ownGroup = (): boolean => {
    return group?.creatorId === currentUser?.id;
  };

  if (isLoggedIn(currentUser) && !ownGroup())
    return <>{Messages.users.permissionDenied()}</>;

  if (isNoAdmin()) return <>{Messages.groups.setToNoAdmin()}</>;

  if (isLoggedIn(currentUser))
    return (
      <>
        <Link href={`/groups/${query.name}`}>
          <a>
            <h1 style={{ color: "white" }}>{query.name}</h1>
          </a>
        </Link>

        <h5 style={{ color: "white" }}>
          {Messages.groups.settings.nameWithGroup()}
        </h5>

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
