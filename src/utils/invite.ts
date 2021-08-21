import { LocalStorage } from "../constants/common";

export const redeemedInviteToken = (): string | null => {
  if (typeof localStorage !== "undefined")
    return localStorage.getItem(LocalStorage.RedeemedInviteToken);
  return null;
};
