import dayjs from "dayjs";
import { Time } from "../constants/common";
import Messages from "./messages";

export const formatDate = (timeStamp: string, withMiddot = true): string => {
  return (
    (withMiddot ? Messages.middotWithSpaces() : "") +
    dayjs(parseInt(timeStamp)).format("MMMM D, YYYY")
  );
};

export const formatDateTime = (
  timeStamp: string,
  withMiddot = true
): string => {
  return (
    (withMiddot ? Messages.middotWithSpaces() : "") +
    dayjs(parseInt(timeStamp)).format("dddd, MMMM D, YYYY [at] h:mm a")
  );
};

export const timeFromNow = (timeStamp: string, withMiddot = true): string => {
  const now = new Date();
  const secondsFromNow: number = (parseInt(timeStamp) - now.getTime()) / 1000;
  return timeMessage(timeStamp, secondsFromNow, withMiddot);
};

export const timeAgo = (timeStamp: string, withMiddot = true): string => {
  const now = new Date();
  const secondsPast: number = (now.getTime() - parseInt(timeStamp)) / 1000;
  return timeMessage(timeStamp, secondsPast, withMiddot);
};

const timeMessage = (
  timeStamp: string,
  timeDifference: number,
  withMiddot = true
): string => {
  const middot = withMiddot ? Messages.middotWithSpaces() : "";
  if (timeDifference < Time.Minute) {
    return middot + Messages.time.now();
  }
  if (timeDifference < Time.Hour) {
    return (
      middot + Messages.time.minutes(Math.round(timeDifference / Time.Minute))
    );
  }
  if (timeDifference < Time.Day) {
    return middot + Messages.time.hours(Math.round(timeDifference / Time.Hour));
  }
  if (timeDifference < Time.Month) {
    return middot + Messages.time.days(Math.round(timeDifference / Time.Day));
  }
  return formatDate(timeStamp, withMiddot);
};

export const sameDay = (timeStamp1: string, timeStamp2: string): boolean => {
  return (
    dayjs(parseInt(timeStamp1)).format("dddd, MMMM D, YYYY") ===
    dayjs(parseInt(timeStamp2)).format("dddd, MMMM D, YYYY")
  );
};

export const nowRoundedToNextHour = (): Date => {
  const oneHour = Time.Hour * 1000;
  return new Date(Math.round(new Date().getTime() / oneHour) * oneHour);
};
