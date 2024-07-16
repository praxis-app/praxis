export enum DecisionMakingModel {
  Consent = 'consent',
  Consensus = 'consensus',
  MajorityVote = 'majority-vote',
}

export enum ProposalActionType {
  CHANGE_COVER_PHOTO,
  CHANGE_DESCRIPTION,
  CHANGE_NAME,
  CHANGE_ROLE,
  CHANGE_SETTINGS,
  CREATE_ROLE,
  PLAN_EVENT,
  TEST,
}

export enum ProposalStage {
  Voting = 'voting',
  Ratified = 'ratified',
  Revision = 'revision',
  Closed = 'closed',
}
