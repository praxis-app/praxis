export enum MinGroupSizeToRatify {
  Consensus = 3,
  Consent = 2,
}

export enum DecisionMakingModel {
  Consensus = 'consensus',
  Consent = 'consent',
}

export enum ProposalActionType {
  ChangeGroupCoverPhoto = 'change-cover-photo',
  ChangeGroupDescription = 'change-description',
  ChangeGroupName = 'change-name',
  ChangeGroupRole = 'change-role',
  ChangeGroupSettings = 'change-settings',
  CreateGroupRole = 'create-role',
  PlanGroupEvent = 'plan-event',
  Test = 'test',
}

export enum ProposalStage {
  Ratified = 'ratified',
  Revision = 'revision',
  Voting = 'voting',
}
