export const MIN_GROUP_SIZE_TO_RATIFY = 3;
export const MIN_VOTE_COUNT_TO_RATIFY = 2;

export enum ProposalActionTypes {
  AssignRole = "assign-role",
  ChangeCoverPhoto = "change-cover-photo",
  ChangeDescription = "change-description",
  ChangeName = "change-name",
  ChangeRole = "change-role",
  ChangeSettings = "change-settings",
  CreateRole = "create-role",
  PlanEvent = "plan-event",
  Test = "test",
}

export enum ProposalStages {
  Ratified = "ratified",
  Revision = "revision",
  Voting = "voting",
}
