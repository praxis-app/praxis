import { ActionTypes } from "../constants/motion";
import Messages from "./messages";

export const motionActionLabel = (action: string): string => {
  const actionTypes = Messages.motions.form.actionTypes;
  switch (action) {
    case ActionTypes.PlanEvent:
      return actionTypes.planEvent();
    case ActionTypes.ChangeName:
      return actionTypes.changeName();
    case ActionTypes.ChangeImage:
      return actionTypes.changeImage();
    case ActionTypes.ChangeDescription:
      return actionTypes.changeDescription();
    case ActionTypes.ChangeSettings:
      return actionTypes.changeSettings();
    case ActionTypes.CreateRole:
      return actionTypes.createRole();
    case ActionTypes.ChangeRole:
      return actionTypes.changeRole();
    case ActionTypes.AssignRole:
      return actionTypes.assignRole();
    case ActionTypes.Test:
      return actionTypes.test();
    default:
      return "";
  }
};
