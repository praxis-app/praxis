export enum SettingStates {
  On = "true",
  Off = "false",
}

export enum GroupSettings {
  NoAdmin = "no-admin",
  VotingType = "voting-type",
  RatificationThreshold = "ratification-threshold",
  ReservationsLimit = "reservations-limit",
  StandAsidesLimit = "stand-asides-limit",
  XToPass = "x-to-pass",
  XToBlock = "x-to-block",
}

export enum GroupDefaults {
  NoAdmin = "false",
  VotingType = "consensus",
  RatificationThreshold = "50",
  ReservationsLimit = "2",
  StandAsidesLimit = "2",
  XToPass = "2",
  XToBlock = "2",
}

export const INITIAL_GROUP_SETTINGS = [
  {
    name: GroupSettings.NoAdmin,
    value: GroupDefaults.NoAdmin,
  },
  {
    name: GroupSettings.VotingType,
    value: GroupDefaults.VotingType,
  },
  {
    name: GroupSettings.ReservationsLimit,
    value: GroupDefaults.ReservationsLimit,
  },
  {
    name: GroupSettings.StandAsidesLimit,
    value: GroupDefaults.StandAsidesLimit,
  },
  {
    name: GroupSettings.RatificationThreshold,
    value: GroupDefaults.RatificationThreshold,
  },
  {
    name: GroupSettings.XToPass,
    value: GroupDefaults.XToPass,
  },
  {
    name: GroupSettings.XToBlock,
    value: GroupDefaults.XToBlock,
  },
];
