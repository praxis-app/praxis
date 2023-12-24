export enum DecisionMakingModel {
  Consensus = 'consensus',
  Consent = 'consent',
  MajorityVote = 'majority-vote',
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
  Voting = 'voting',
  Ratified = 'ratified',
  Revision = 'revision',
  Closed = 'closed',
}
