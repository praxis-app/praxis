// TODO: Implement rotating admin model
export enum GroupAdminModel {
  NoAdmin = 'no-admin',
  Rotating = 'rotating',
  Standard = 'standard',
}

export enum GroupPrivacy {
  Private = 'private',
  Public = 'public',
}

export const enum GroupTab {
  About = 'about',
  Events = 'events',
  Proposals = 'proposals',
}

export const enum GroupSettingsFieldName {
  AdminModel = 'adminModel',
  DecisionMakingModel = 'decisionMakingModel',
  RatificationThreshold = 'ratificationThreshold',
  ReservationsLimit = 'reservationsLimit',
  StandAsidesLimit = 'standAsidesLimit',
  VotingTimeLimit = 'votingTimeLimit',
  Privacy = 'privacy',
}
