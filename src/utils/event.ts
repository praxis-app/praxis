import dayjs from "dayjs";
import humanizeDuration from "humanize-duration";
import { AttendingStatus } from "../constants/event";
import { formatDateTime, sameDay } from "./clientIndex";
import Messages from "./messages";

export const isHosting = (
  attendees: ClientEventAttendee[],
  currentUser: CurrentUser | undefined
): boolean => {
  if (!currentUser) return false;
  return Boolean(
    attendees.find(
      (attendee) =>
        attendee.userId === currentUser.id &&
        (attendee.status === AttendingStatus.Host ||
          attendee.status === AttendingStatus.CoHost)
    )
  );
};

export const displayEventTime = (startsAt: string, endsAt?: string): string => {
  if (endsAt && sameDay(startsAt, endsAt) && startsAt !== endsAt)
    return (
      formatDateTime(startsAt, false) +
      dayjs(parseInt(endsAt)).format(" [-] h:mm a")
    );
  return formatDateTime(startsAt, false);
};

export const displayEventDuration = (
  startsAt: string,
  endsAt: string
): string | null => {
  if (endsAt && sameDay(startsAt, endsAt) && startsAt !== endsAt) {
    const difference = dayjs(parseInt(endsAt)).diff(dayjs(parseInt(startsAt)));
    return humanizeDuration(difference)
      .replace(/,/g, "")
      .replace(/hours|hour/g, Messages.time.hr())
      .replace(/minutes|minute/g, Messages.time.min());
  }
  return null;
};

export const displayAttendees = (attendees: ClientEventAttendee[]): string => {
  const going = attendees.filter(
    (attendee) => attendee.status === AttendingStatus.Going
  );
  const interested = attendees.filter(
    (attendee) => attendee.status === AttendingStatus.Interested
  );
  return `${
    going.length ? going.length + " " + Messages.events.attendance.going() : ""
  }${going.length && interested.length ? Messages.middotWithSpaces() : ""}${
    interested.length
      ? interested.length + " " + Messages.events.attendance.interested()
      : ""
  }`;
};
