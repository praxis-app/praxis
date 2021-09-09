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
  LinearProgress,
} from "@material-ui/core";

import { VotingTypes } from "../../constants/vote";
import { RatificationThreshold } from "../../constants/motion";
import { GroupSettings, SettingStates } from "../../constants/setting";
import { UPDATE_SETTINGS } from "../../apollo/client/mutations";
import styles from "../../styles/Setting/SettingsForm.module.scss";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import { displayName } from "../../utils/items";
import SubmitButton from "../Shared/SubmitButton";
import Dropdown from "../Shared/Dropdown";
import CancelButton from "../Shared/CancelButton";

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

export interface SettingsFormProps {
  settings: Setting[];
  setSettings: (settings: Setting[]) => void;
  unsavedSettings: Setting[];
  setUnsavedSettings: (settings: Setting[]) => void;
  anyUnsavedSettings: boolean;
  submitButtonText?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const SettingsForm = ({
  settings,
  setSettings,
  unsavedSettings,
  setUnsavedSettings,
  anyUnsavedSettings,
  submitButtonText,
  onSubmit,
  onCancel,
}: SettingsFormProps) => {
  const currentUser = useCurrentUser();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [updateSettings] = useMutation(UPDATE_SETTINGS);

  const submitText = submitButtonText || Messages.actions.save();

  useEffect(() => {
    setUnsavedSettings(settings);
  }, [settings]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);

    if (onSubmit) onSubmit();
    else {
      try {
        const { data } = await updateSettings({
          variables: {
            settings: unsavedSettings.map(({ id, groupId, value }) => {
              return { id, groupId, value };
            }),
          },
        });
        const newSettings = data.updateSettings.settings;
        setUnsavedSettings(newSettings);
        setSettings(newSettings);
      } catch (err) {
        alert(err);
      }
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
    setByName(
      name,
      value === SettingStates.On ? SettingStates.Off : SettingStates.On
    );
  };

  const handleSliderChange = (_event: any, newValue: number | number[]) => {
    setByName(GroupSettings.RatificationThreshold, newValue.toString());
  };

  const handleBlur = (value: string) => {
    if (parseInt(value) < RatificationThreshold.Min || value === "") {
      setByName(
        GroupSettings.RatificationThreshold,
        RatificationThreshold.Min.toString()
      );
    } else if (parseInt(value) > RatificationThreshold.Max) {
      setByName(
        GroupSettings.RatificationThreshold,
        RatificationThreshold.Max.toString()
      );
    }
  };

  const setByName = (name: string, value: string) => {
    setUnsavedSettings(
      unsavedSettings.map((setting) => {
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
    const setting = unsavedSettings.find((setting) => setting.name === name);
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
    if (!Object.values(GroupSettings).includes(name as GroupSettings))
      return false;
    return true;
  };

  if (currentUser && !settings.length) return <LinearProgress />;

  if (!currentUser) return <>{Messages.users.permissionDenied()}</>;

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <FormGroup>
        {unsavedSettings.map(({ id, name, value }: Setting) => {
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
                    justifyContent="flex-end"
                    style={{ marginBottom: "-50px" }}
                  >
                    <Grid item xs={5}>
                      <Slider
                        min={RatificationThreshold.Min}
                        max={RatificationThreshold.Max}
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
                          min: RatificationThreshold.Min,
                          max: RatificationThreshold.Max,
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

      <div className={styles.flexEnd}>
        {onCancel && (
          <CancelButton onClick={onCancel} style={{ marginRight: 12 }} />
        )}

        <SubmitButton disabled={!anyUnsavedSettings}>
          {submitLoading ? Messages.states.saving() : submitText}
        </SubmitButton>
      </div>
    </form>
  );
};

export default SettingsForm;
