export const MIN_GROUP_SIZE_TO_RATIFY = 3;
export const MIN_VOTE_COUNT_TO_RATIFY = 2;

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
