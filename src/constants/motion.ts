import Messages from "../utils/messages";

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

export const ActionTypeOptions: ActionTypeOption[] = [
  {
    message: Messages.motions.form.actionTypes.planEvent(),
    value: ActionTypes.PlanEvent,
  },
  {
    message: Messages.motions.form.actionTypes.changeSettings(),
    value: ActionTypes.ChangeSettings,
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
    message: Messages.motions.form.actionTypes.test(),
    value: ActionTypes.Test,
  },
  {
    message: Messages.motions.form.actionTypes.changeImage(),
    value: ActionTypes.ChangeImage,
  },
];
