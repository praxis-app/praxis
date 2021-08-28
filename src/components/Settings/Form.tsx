import React, { ChangeEvent, useEffect } from "react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  FormGroup,
  Switch,
  MenuItem,
  Grid,
  Slider,
  Input,
  CircularProgress,
} from "@material-ui/core";

import { VotingTypes } from "../../constants/vote";
import { GroupSettings, SettingStates } from "../../constants/setting";
import { UPDATE_SETTINGS } from "../../apollo/client/mutations";
import styles from "../../styles/Setting/SettingsForm.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { displayName } from "../../utils/items";
import SubmitButton from "../Shared/SubmitButton";
import Dropdown from "../Shared/Dropdown";

const NumberInput = ({
  value,
  name,
  minimum,
  handleSettingChange,
}: {
  value: string;
  name: string;
  minimum: number;
  handleSettingChange: (
    event: ChangeEvent<{ value: string }>,
    name: string
  ) => void;
}) => (
  <Input
    value={value}
    margin="dense"
    onChange={(e) => handleSettingChange(e, name)}
    inputProps={{
      min: minimum,
      type: "number",
    }}
    style={{ width: "50px" }}
  />
);

interface Props {
  settings: Setting[];
  setSettings: (settings: Setting[]) => void;
  unsavedSettings?: Setting[];
  setUnsavedSettings?: (settings: Setting[]) => void;
  anyUnsavedSettings?: boolean;
}

const SettingsForm = ({
  settings,
  setSettings,
  unsavedSettings,
  setUnsavedSettings,
  anyUnsavedSettings,
}: Props) => {
  const currentUser = useCurrentUser();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [updateSettings] = useMutation(UPDATE_SETTINGS);

  useEffect(() => {
    if (
      unsavedSettings &&
      setUnsavedSettings &&
      settings.length &&
      !unsavedSettings.length
    )
      setUnsavedSettings(settings);
  }, [settings]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const { data } = await updateSettings({
        variables: {
          settings: settings.map(({ id, groupId, value }) => {
            return { id, groupId, value };
          }),
        },
      });
      const newSettings = data.updateSettings.settings;
      if (setUnsavedSettings) setUnsavedSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      alert(err);
    }
    setSubmitLoading(false);
  };

  const handleSettingChange = (
    event: ChangeEvent<{ value: unknown }>,
    name: string
  ) => {
    setByName(name, event.target.value as string);
  };

  const handleSwitchChange = (name: string, value: string) => {
    setByName(name, value === "true" ? "false" : "true");
  };

  const handleSliderChange = (_event: any, newValue: number | number[]) => {
    setByName(GroupSettings.RatificationThreshold, newValue.toString());
  };

  const handleBlur = (value: string) => {
    if (parseInt(value) < 0 || value === "") {
      setByName(GroupSettings.RatificationThreshold, "1");
    } else if (parseInt(value) > 100) {
      setByName(GroupSettings.RatificationThreshold, "100");
    }
  };

  const setByName = (name: string, value: string) => {
    setSettings(
      settings.map((setting) => {
        if (setting.name === name)
          return {
            ...setting,
            value,
          };
        return setting;
      })
    );
  };

  const valueByName = (name: string): string => {
    const setting = settings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const canShowSetting = (name: string): boolean => {
    const votingType = valueByName(GroupSettings.VotingType);
    if (!votingType) return false;
    if (
      votingType !== VotingTypes.Consensus &&
      (name === GroupSettings.RatificationThreshold ||
        name === GroupSettings.ReservationsLimit ||
        name === GroupSettings.StandAsidesLimit)
    )
      return false;
    if (
      votingType !== VotingTypes.XToPass &&
      (name === GroupSettings.XToPass || name === GroupSettings.XToBlock)
    )
      return false;

    return true;
  };

  if (currentUser && !settings.length) return <CircularProgress />;

  if (!currentUser) return <>{Messages.users.permissionDenied()}</>;

  return (
    <form onSubmit={(e) => handleSubmit(e)} className={styles.form}>
      <FormGroup>
        {settings.map(({ id, name, value }: Setting) => {
          if (canShowSetting(name))
            return (
              <div key={id} className={styles.setting}>
                <div className={styles.settingName}>{displayName(name)}</div>

                {name === GroupSettings.NoAdmin && (
                  <Switch
                    checked={value === SettingStates.On}
                    onChange={() => handleSwitchChange(name, value)}
                    color="primary"
                  />
                )}

                {name === GroupSettings.VotingType && (
                  <Dropdown
                    value={value}
                    onChange={(e) => handleSettingChange(e, name)}
                  >
                    <MenuItem value={VotingTypes.Consensus}>
                      {Messages.votes.votingTypes.consensus()}
                    </MenuItem>
                    <MenuItem value={VotingTypes.XToPass}>
                      {Messages.votes.votingTypes.xToPass()}
                    </MenuItem>
                    <MenuItem value={VotingTypes.Majority}>
                      {Messages.votes.votingTypes.majority()}
                    </MenuItem>
                  </Dropdown>
                )}

                {name === GroupSettings.VoteVerification && (
                  <Switch
                    checked={value === SettingStates.On}
                    onChange={() => handleSwitchChange(name, value)}
                    color="primary"
                  />
                )}

                {(name === GroupSettings.XToPass ||
                  name === GroupSettings.XToBlock) && (
                  <NumberInput
                    value={value}
                    name={name}
                    minimum={1}
                    handleSettingChange={handleSettingChange}
                  />
                )}

                {(name === GroupSettings.ReservationsLimit ||
                  name === GroupSettings.StandAsidesLimit) && (
                  <NumberInput
                    value={value}
                    name={name}
                    minimum={0}
                    handleSettingChange={handleSettingChange}
                  />
                )}

                {name === GroupSettings.RatificationThreshold && (
                  <Grid
                    container
                    spacing={2}
                    justify="flex-end"
                    style={{ marginBottom: "-50px" }}
                  >
                    <Grid item xs={5}>
                      <Slider
                        min={1}
                        max={100}
                        value={parseInt(value)}
                        onChange={handleSliderChange}
                      />
                    </Grid>
                    <Grid item>
                      <Input
                        value={value}
                        margin="dense"
                        onChange={(e) => handleSettingChange(e, name)}
                        onBlur={() => handleBlur(value)}
                        inputProps={{
                          min: 1,
                          max: 100,
                          type: "number",
                        }}
                      />
                      %
                    </Grid>
                  </Grid>
                )}
              </div>
            );
        })}
      </FormGroup>

      {anyUnsavedSettings && (
        <SubmitButton>
          {submitLoading ? Messages.states.saving() : Messages.actions.save()}
        </SubmitButton>
      )}
    </form>
  );
};

export default SettingsForm;
