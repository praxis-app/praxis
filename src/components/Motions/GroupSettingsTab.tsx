import React, { useState } from "react";
import { Typography } from "@material-ui/core";
import { useSettingsByGroupId } from "../../hooks";
import SettingsForm from "../Settings/Form";
import Messages from "../../utils/messages";

interface Props {
  groupId: string;
  setSelectedGroupId: (id: string) => void;
  setActionData: (actionData: ActionData | undefined) => void;
  setAction: (action: string) => void;
  resetTabs: () => void;
}

const GroupSettingsTab = ({
  groupId,
  setSelectedGroupId,
  setActionData,
  setAction,
  resetTabs,
}: Props) => {
  const [groupSettings, setGroupSettings] = useSettingsByGroupId(groupId);
  const [unsavedSettings, setUnsavedSettings] = useState<ClientSetting[]>([]);

  const handleSubmit = () => {
    setActionData({ groupSettings: settingsChanged() });
    setUnsavedSettings(groupSettings);
    resetTabs();
  };

  const handleCancel = () => {
    setSelectedGroupId("");
    setActionData(undefined);
    setAction("");
    resetTabs();
  };

  const settingsChanged = (): SettingInput[] => {
    const changed = unsavedSettings.filter(
      (unsavedSetting) =>
        !groupSettings.some(
          (setting) =>
            unsavedSetting.name === setting.name &&
            unsavedSetting.value === setting.value
        )
    );
    return changed.map(({ id, name, value }) => {
      return { id, groupId, name, value };
    });
  };

  return (
    <>
      <Typography gutterBottom style={{ marginTop: 12 }}>
        {Messages.motions.form.enterProposedSettings()}
      </Typography>

      <SettingsForm
        settings={groupSettings}
        setSettings={setGroupSettings}
        unsavedSettings={unsavedSettings}
        setUnsavedSettings={setUnsavedSettings}
        anyUnsavedSettings={Boolean(settingsChanged().length)}
        submitButtonText={Messages.actions.confirm()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
};

export default GroupSettingsTab;
