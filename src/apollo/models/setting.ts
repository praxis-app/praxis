import { Settings } from "../../constants";

export const groupSettingByName = (
  settings: BackendSetting[],
  name: Settings.GroupSettings
): string => {
  const setting = settings.find((setting) => setting.name === name);
  return setting?.value as string;
};
