import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  COVER_PHOTO_BY_EVENT_ID,
  EVENT,
  EVENTS_BY_GROUP_ID,
  EVENT_ATTENDEES,
} from "../apollo/client/queries";
import { noCache } from "../utils/clientIndex";
import { EventTimeFrames } from "../constants/event";

export const useEventById = (
  id: string | string[] | undefined,
  callDep?: any
): [ClientEvent | undefined, (event: ClientEvent) => void, boolean] => {
  const [event, setEvent] = useState<ClientEvent>();
  const [getEventRes, eventRes] = useLazyQuery(EVENT, noCache);

  useEffect(() => {
    if (id && typeof id === "string")
      getEventRes({
        variables: {
          id,
        },
      });
  }, [id, JSON.stringify(callDep)]);

  useEffect(() => {
    if (eventRes.data) setEvent(eventRes.data.event);
  }, [eventRes.data]);

  return [event, setEvent, eventRes.loading];
};

export const useCoverPhotoByEventId = (
  eventId: string | string[] | undefined,
  callDep?: any
): [ClientImage | undefined, (coverPhoto: ClientImage) => void, boolean] => {
  const [coverPhoto, setCoverPhoto] = useState<ClientImage>();
  const [getCoverPhotoRes, coverPhotoRes] = useLazyQuery(
    COVER_PHOTO_BY_EVENT_ID,
    noCache
  );

  useEffect(() => {
    if (eventId && typeof eventId === "string")
      getCoverPhotoRes({
        variables: {
          eventId,
        },
      });
  }, [eventId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (coverPhotoRes.data)
      setCoverPhoto(coverPhotoRes.data.coverPhotoByEventId);
  }, [coverPhotoRes.data]);

  return [coverPhoto, setCoverPhoto, coverPhotoRes.loading];
};

export const useEventsByGroupId = (
  groupId: string | undefined,
  timeFrame: EventTimeFrames | undefined,
  callDep?: any
): [ClientEvent[], (members: ClientEvent[]) => void, boolean] => {
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [getEventsRes, eventsRes] = useLazyQuery(EVENTS_BY_GROUP_ID, noCache);

  useEffect(() => {
    if (groupId)
      getEventsRes({
        variables: {
          groupId,
          timeFrame,
        },
      });
  }, [groupId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (eventsRes.data) setEvents(eventsRes.data.eventsByGroupId);
  }, [eventsRes.data]);

  return [events, setEvents, eventsRes.loading];
};

export const useAttendeesByEventId = (
  eventId: string | string[] | undefined,
  callDep?: any
): [
  ClientEventAttendee[],
  (attendees: ClientEventAttendee[]) => void,
  boolean
] => {
  const [attendees, setAttendees] = useState<ClientEventAttendee[]>([]);
  const [getAttendeesRes, attendeesRes] = useLazyQuery(
    EVENT_ATTENDEES,
    noCache
  );

  useEffect(() => {
    if (eventId && typeof eventId === "string")
      getAttendeesRes({
        variables: {
          eventId,
        },
      });
  }, [eventId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (attendeesRes.data) setAttendees(attendeesRes.data.eventAttendees);
  }, [attendeesRes.data]);

  return [attendees, setAttendees, attendeesRes.loading];
};
