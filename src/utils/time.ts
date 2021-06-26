import { Common } from "../constants";
import Messages from "./messages";

export const formatDate = (timeStamp: string): string => {
  return (
    Messages.middotWithSpaces() +
    new Date(parseInt(timeStamp)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
};

export const timeAgo = (timeStamp: string): string => {
  const now = new Date();
  const secondsPast: number = (now.getTime() - parseInt(timeStamp)) / 1000;

  if (secondsPast < Common.Time.Minute) {
    return Messages.time.now();
  }
  if (secondsPast < Common.Time.Hour) {
    return Messages.time.minutesAgo(
      Math.round(secondsPast / Common.Time.Minute)
    );
  }
  if (secondsPast < Common.Time.Day) {
    return Messages.time.hoursAgo(Math.round(secondsPast / Common.Time.Hour));
  }
  if (secondsPast < Common.Time.Month) {
    return Messages.time.daysAgo(Math.round(secondsPast / Common.Time.Day));
  }

  return formatDate(timeStamp);
};
