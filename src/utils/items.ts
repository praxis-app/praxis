import { feedVar } from "../apollo/client/localState";
import { INITIAL_FEED_STATE } from "../constants/common";

export const displayName = (name: string): string => {
  let shownName = name[0].toUpperCase() + name.slice(1);
  shownName = shownName.replace(/-/g, " ");
  return shownName;
};

export const pluralize = (size: number): string => {
  if (size === 0 || size > 1) return "s";
  return "";
};

export const paginate = (
  totalItems: any[],
  currentPage: number,
  pageSize: number
): any[] => {
  let items = totalItems.reverse();

  if (currentPage > 0)
    items = items.slice(currentPage * pageSize, items.length);

  return items.slice(0, pageSize);
};

export const resetFeed = (): void => {
  feedVar(INITIAL_FEED_STATE);
};
