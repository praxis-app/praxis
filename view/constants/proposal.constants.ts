export enum DecisionMakingModel {
  Consensus = 'consensus',
  Consent = 'consent',
}

export enum VotingTimeLimit {
  Unlimited = 0,
  OneMinute = 1,
  HalfHour = 30,
  OneHour = 60,
  HalfDay = 60 * 12,
  OneDay = 60 * 24,
  ThreeDays = 60 * 24 * 3,
  OneWeek = 60 * 24 * 7,
  TwoWeeks = 60 * 24 * 14,
}

export enum ProposalActionType {
  ChangeCoverPhoto = 'change-cover-photo',
  ChangeDescription = 'change-description',
  ChangeName = 'change-name',
  ChangeRole = 'change-role',
  ChangeSettings = 'change-settings',
  CreateRole = 'create-role',
  PlanEvent = 'plan-event',
  Test = 'test',
}

export enum ProposalStage {
  Voting = 'voting',
  Ratified = 'ratified',
  Revision = 'revision',
  Closed = 'closed',
}

export enum ProposalFormFieldName {
  Action = 'action',
  Body = 'body',
  ClosingAt = 'closingAt',
  GroupId = 'groupId',
  Images = 'images',
}

export enum ProposalActionFieldName {
  ActionType = 'action.actionType',
  Event = 'action.event',
  GroupCoverPhoto = 'action.groupCoverPhoto',
  GroupDescription = 'action.groupDescription',
  GroupName = 'action.groupName',
  GroupSettings = 'action.groupSettings',
  Role = 'action.role',
  RoleId = 'action.role.id',
}

export enum ProposeRoleModalFieldName {
  Permissions = 'permissions',
  RoleToUpdateId = 'roleToUpdateId',
}
