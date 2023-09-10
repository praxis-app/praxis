export const MIN_GROUP_SIZE_TO_RATIFY = 1; // 3;
export const MIN_VOTE_COUNT_TO_RATIFY = 1; // 2;

export enum ProposalActionType {
  ChangeGroupCoverPhoto = "change-cover-photo",
  ChangeGroupDescription = "change-description",
  ChangeGroupName = "change-name",
  ChangeGroupSettings = "change-settings",
  ChangeRole = "change-role",
  CreateRole = "create-role",
  PlanEvent = "plan-event",
  Test = "test",
}

export enum ProposalStage {
  Ratified = "ratified",
  Revision = "revision",
  Voting = "voting",
}
