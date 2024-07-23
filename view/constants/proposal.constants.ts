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

// TODO: Consider adding as graph enum
export enum ProposalScope {
  Group = 'group',
  Server = 'server',
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
