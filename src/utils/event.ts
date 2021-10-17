import { AttendingStatus } from "../constants/event";

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
