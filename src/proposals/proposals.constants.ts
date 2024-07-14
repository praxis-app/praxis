export enum DecisionMakingModel {
  Consensus = 'consensus',
  Consent = 'consent',
  MajorityVote = 'majority-vote',
}

export enum ProposalActionType {
  CHANGE_GROUP_COVER_PHOTO,
  CHANGE_GROUP_DESCRIPTION,
  CHANGE_GROUP_NAME,
  CHANGE_GROUP_ROLE,
  CHANGE_GROUP_SETTINGS,
  CHANGE_SERVER_ROLE,
  CREATE_GROUP_ROLE,
  CREATE_SERVER_ROLE,
  PLAN_GROUP_EVENT,
  TEST,
}

export enum ProposalStage {
  Voting = 'voting',
  Ratified = 'ratified',
  Revision = 'revision',
  Closed = 'closed',
}
