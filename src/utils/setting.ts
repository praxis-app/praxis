import { GroupSettings, SettingStates } from "../constants/setting";
import { VotingTypes } from "../constants/vote";
import { displayName } from "./items";
import Messages from "./messages";

export const descriptionByName = (name: string) => {
  const descriptions = Messages.settings.groups.descriptions;
  switch (name) {
    case GroupSettings.NoAdmin:
      return descriptions.noAdmin();
    case GroupSettings.VotingType:
      return descriptions.votingType();
    case GroupSettings.RatificationThreshold:
      return descriptions.ratificationThreshold();
    case GroupSettings.ReservationsLimit:
      return descriptions.reservationsLimit();
    case GroupSettings.StandAsidesLimit:
      return descriptions.standAsidesLimit();
    case GroupSettings.XToPass:
      return descriptions.xToPass();
    case GroupSettings.XToBlock:
      return descriptions.xToBlock();
  }
};

export const displaySettingValue = ({ name, value }: SettingInput): string => {
  if (name === GroupSettings.RatificationThreshold) return value + "%";
  if (value === SettingStates.On) return Messages.settings.states.on();
  if (value === SettingStates.Off) return Messages.settings.states.off();
  return displayName(value);
};

export const canShowSetting = (name: string, votingType: string): boolean => {
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

export const settingValueByName = (
  name: string,
  settings: ClientSetting[]
): string => {
  const setting = settings.find((setting) => setting.name === name);
  return setting?.value || "";
};
