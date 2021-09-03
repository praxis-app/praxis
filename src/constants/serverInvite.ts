import Messages from "../utils/messages";
import { Time } from "./common";

export const ITEM_TYPE = "invite";

export const MAX_USES_OPTIONS = [1, 5, 10, 25, 50, 100];

export const EXPIRES_AT_OPTIONS: ExpiresAtOption[] = [
  {
    message: Messages.invites.form.expiresAtOptions.oneDay(),
    value: Time.Day,
  },
  {
    message: Messages.invites.form.expiresAtOptions.sevenDays(),
    value: Time.Week,
  },
  {
    message: Messages.invites.form.expiresAtOptions.oneMonth(),
    value: Time.Month,
  },
  {
    message: Messages.invites.form.expiresAtOptions.never(),
    value: "",
  },
];
