export enum ActionTypes {
  PlanEvent = "plan-event",
  ChangeName = "change-name",
  ChangeImage = "change-image",
  ChangeDescription = "change-description",
  ChangeSettings = "change-settings",
  ChangeRules = "change-rules",
  Test = "test",
}

export enum Stages {
  Voting = "voting",
  Revision = "revision",
  Ratified = "ratified",
}

export enum ActionData {
  NewGroupName = "newGroupName",
  NewGroupImage = "newGroupImage",
  NewGroupImagePath = "newGroupImagePath",
  NewGroupDescription = "newGroupDescription",
}
