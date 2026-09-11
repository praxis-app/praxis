export const URL_REGEX = /(https?:\/\/[^\s]+)/g;
export const MIDDOT_WITH_SPACES = ' · ';
export const USER_SETTINGS_SECTION_PARAM = 'section';

export enum Time {
  Minute = 60,
  Hour = 3600,
  Day = 86400,
  Week = 604800,
  Month = 2628000,
}

export enum KeyCodes {
  Enter = 'Enter',
  Escape = 'Escape',
}

export enum BrowserEvents {
  Keydown = 'keydown',
  MouseDown = 'mousedown',
  MouseUp = 'mouseup',
  Resize = 'resize',
  Scroll = 'scroll',
}

export enum NavigationPaths {
  Root = '/',
  About = '/about',
  Explore = '/explore',
  Events = '/events',
  Login = '/auth/login',
  GeneralSettings = '/settings/general',
  Invites = '/settings/invites',
  ManageServers = '/settings/servers',
  ProposalSettings = '/settings/proposals',
  Roles = '/settings/roles',
  Settings = '/settings',
  SignUp = '/auth/signup',
  UserSettings = '/users/settings',
}

export enum UserSettingsSections {
  Profile = 'profile',
  Notifications = 'notifications',
}

export enum TruncationSizes {
  ExtraSmall = 16,
  Small = 25,
  Medium = 35,
  Large = 65,
  ExtraLarge = 175,
}

// TODO: Move decisions panel open setting to a DB table

export enum LocalStorageKeys {
  AccessToken = 'access_token',
  DecisionsPanelOpen = 'decisions-panel-open',
  InviteToken = 'invite-token',
  HideWelcomeMessage = 'hide-welcome-message',
  PanelWidths = 'panel-widths',
}
