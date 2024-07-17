export enum DecisionMakingModel {
  Consent = 'consent',
  Consensus = 'consensus',
  MajorityVote = 'majority-vote',
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
