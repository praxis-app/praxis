import Messages from "../utils/messages";

export const MIN_GROUP_SIZE_TO_RATIFY = 3;

export enum ActionTypes {
  PlanEvent = "plan-event",
  ChangeName = "change-name",
  ChangeImage = "change-image",
  ChangeDescription = "change-description",
  ChangeSettings = "change-settings",
  CreateRole = "create-role",
  ChangeRole = "change-role",
  AssignRole = "assign-role",
  Test = "test",
}

export enum Stages {
  Voting = "voting",
  Revision = "revision",
  Ratified = "ratified",
}

export enum ActionData {
  GroupName = "groupName",
  GroupImage = "groupImage",
  GroupImagePath = "groupImagePath",
  GroupDescription = "groupDescription",
}

export enum RatificationThreshold {
  Min = 1,
  Max = 100,
}

interface ActionTypeOption {
  message: string;
  value: ActionTypes;
}

export const ACTION_TYPE_OPTIONS: ActionTypeOption[] = [
  {
    message: Messages.motions.form.actionTypes.planEvent(),
    value: ActionTypes.PlanEvent,
  },
  {
    message: Messages.motions.form.actionTypes.changeName(),
    value: ActionTypes.ChangeName,
  },
  {
    message: Messages.motions.form.actionTypes.changeDescription(),
    value: ActionTypes.ChangeDescription,
  },
  {
    message: Messages.motions.form.actionTypes.changeImage(),
    value: ActionTypes.ChangeImage,
  },
  {
    message: Messages.motions.form.actionTypes.changeSettings(),
    value: ActionTypes.ChangeSettings,
  },
  {
    message: Messages.motions.form.actionTypes.createRole(),
    value: ActionTypes.CreateRole,
  },
  {
    message: Messages.motions.form.actionTypes.changeRole(),
    value: ActionTypes.ChangeRole,
  },
  {
    message: Messages.motions.form.actionTypes.assignRole(),
    value: ActionTypes.AssignRole,
  },
  {
    message: Messages.motions.form.actionTypes.test(),
    value: ActionTypes.Test,
  },
];
