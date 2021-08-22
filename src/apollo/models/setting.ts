import { GroupSettings } from "../../constants/setting";

export const groupSettingByName = (
  settings: BackendSetting[],
  name: GroupSettings
): string => {
  const setting = settings.find((setting) => setting.name === name);
  return setting?.value as string;
};
