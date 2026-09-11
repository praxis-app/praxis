import {
  NavigationPaths,
  USER_SETTINGS_SECTION_PARAM,
  type UserSettingsSections,
} from '@/constants/shared.constants';

export const getUserSettingsPath = (section?: UserSettingsSections) =>
  section
    ? `${NavigationPaths.UserSettings}?${USER_SETTINGS_SECTION_PARAM}=${section}`
    : NavigationPaths.UserSettings;
