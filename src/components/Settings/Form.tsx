import React, { ChangeEvent, Fragment, useEffect } from "react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  FormGroup,
  Switch,
  MenuItem,
  Slider,
  Input,
  LinearProgress,
  Divider,
  makeStyles,
  createStyles,
  Theme,
} from "@material-ui/core";

import { VotingTypes } from "../../constants/vote";
import { RatificationThreshold } from "../../constants/motion";
import { GroupSettings, SettingStates } from "../../constants/setting";
import { UPDATE_SETTINGS } from "../../apollo/client/mutations";
import styles from "../../styles/Setting/SettingsForm.module.scss";
import { useCurrentUser } from "../../hooks";
import SubmitButton from "../Shared/SubmitButton";
import Dropdown from "../Shared/Dropdown";
import CancelButton from "../Shared/CancelButton";
import Messages from "../../utils/messages";
import {
  errorToast,
  canShowSetting,
  settingDescription,
  settingDisplayName,
  settingValue,
} from "../../utils/clientIndex";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropdownIcon: {
      color: theme.palette.primary.main,
    },
    switchRoot: {
      [theme.breakpoints.up("md")]: {
        marginTop: 12,
      },
    },
  })
);

const NumberInput = ({
  value,
  name,
  min,
  handleSettingChange,
}: {
  value: string;
  name: string;
  min: number;
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
      type: "number",
      min,
    }}
    style={{ width: "30px" }}
    disableUnderline
  />
);

export interface SettingsFormProps {
  settings: ClientSetting[];
  setSettings: (settings: ClientSetting[]) => void;
  unsavedSettings: ClientSetting[];
  setUnsavedSettings: (settings: ClientSetting[]) => void;
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
  const votingType = settingValue(GroupSettings.VotingType, unsavedSettings);
  const submitText = submitButtonText || Messages.actions.save();
  const classes = useStyles();

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
        errorToast(err);
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

  if (currentUser && !settings.length) return <LinearProgress />;
  if (!currentUser) return <>{Messages.users.permissionDenied()}</>;

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <FormGroup>
        {unsavedSettings.map(({ id, name, value }: ClientSetting) => {
          if (canShowSetting(name, votingType))
            return (
              <Fragment key={id}>
                <div className={styles.setting}>
                  <div>
                    <div className={styles.name}>
                      {settingDisplayName(name)}
                    </div>
                    <div className={styles.description}>
                      {settingDescription(name)}
                    </div>
                  </div>

                  <div className={styles.inputWrapper}>
                    {name === GroupSettings.NoAdmin && (
                      <Switch
                        checked={value === SettingStates.On}
                        onChange={() => handleSwitchChange(name, value)}
                        color="primary"
                        classes={{ root: classes.switchRoot }}
                      />
                    )}

                    {name === GroupSettings.VotingType && (
                      <Dropdown
                        value={value}
                        onChange={(e) => handleSettingChange(e, name)}
                        disableUnderline
                        classes={{ icon: classes.dropdownIcon }}
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
                        min={1}
                        handleSettingChange={handleSettingChange}
                      />
                    )}

                    {(name === GroupSettings.ReservationsLimit ||
                      name === GroupSettings.StandAsidesLimit) && (
                      <NumberInput
                        value={value}
                        name={name}
                        min={0}
                        handleSettingChange={handleSettingChange}
                      />
                    )}

                    {name === GroupSettings.RatificationThreshold && (
                      <div className={styles.ratificationThresholdInputs}>
                        <Slider
                          min={RatificationThreshold.Min}
                          max={RatificationThreshold.Max}
                          value={parseInt(value)}
                          onChange={handleSliderChange}
                          className={styles.slider}
                        />
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
                          disableUnderline
                          style={{ width: 70 }}
                        />
                        <span className={styles.percentageSign}>%</span>
                      </div>
                    )}
                  </div>
                </div>

                <Divider style={{ marginTop: 0, marginBottom: 6 }} />
              </Fragment>
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
