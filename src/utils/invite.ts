import { Common } from "../constants";

export const redeemedInviteToken = (): string | null => {
  if (typeof localStorage !== "undefined")
    return localStorage.getItem(Common.LocalStorage.RedeemedInviteToken);
  return null;
};
