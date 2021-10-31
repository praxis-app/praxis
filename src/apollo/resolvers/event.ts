import { GraphQLUpload, ApolloError } from "apollo-server-micro";
import { Event, Post, Group } from ".prisma/client";

import prisma from "../../utils/initPrisma";
import { deleteImage, FileUpload } from "../../utils/image";
import {
  filterByThisWeek,
  saveEventCoverPhoto,
  sortByStartsAt,
  whereTimeFrame,
} from "../models/event";
import { AttendingStatus, EventTimeFrames } from "../../constants/event";
import { TypeNames } from "../../constants/common";
import Messages from "../../utils/messages";
import { paginate } from "../models/common";
import { groupConnect } from "../models/group";

interface GroupWithEvents extends Group {
  events: Event[];
}

interface EventFeedInput extends PaginationState {
  eventId: string;
}

interface EventInput {
  name: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  online: boolean;
  externalLink: string;
  coverPhoto: FileUpload;
}

const eventResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    eventFeed: async (
      _: any,
      { eventId, currentPage, pageSize }: EventFeedInput
    ) => {
      const feed: Post[] = [];
      const eventWithPosts = await prisma.event.findFirst({
        where: {
          id: parseInt(eventId),
        },
        include: {
          posts: true,
        },
      });
      feed.push(...(eventWithPosts?.posts || []));
      return {
        pagedItems: paginate(feed, currentPage, pageSize),
        totalItems: feed.length,
      };
    },

    event: async (_: any, { id }: { id: string }) => {
      const event = await prisma.event.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return event;
    },

    allEvents: async (
      _: any,
      { timeFrame, online }: { timeFrame: string; online: boolean }
    ) => {
      const whereOnline = online ? { online: true } : {};
      const events = await prisma.event.findMany({
        where: {
          ...whereTimeFrame(timeFrame),
          ...whereOnline,
        },
      });
      if (timeFrame === EventTimeFrames.Past)
        return sortByStartsAt(events).reverse();
      if (timeFrame === EventTimeFrames.ThisWeek)
        return sortByStartsAt(filterByThisWeek(events)).reverse();
      return sortByStartsAt(events);
    },

    eventsByGroupId: async (
      _: any,
      { groupId, timeFrame }: { groupId: string; timeFrame: string }
    ) => {
      const events = await prisma.event.findMany({
        where: { groupId: parseInt(groupId), ...whereTimeFrame(timeFrame) },
      });
      if (timeFrame === EventTimeFrames.Past)
        return sortByStartsAt(events).reverse();
      return sortByStartsAt(events);
    },

    joinedGroupEventsByUserId: async (
      _: any,
      {
        userId,
        timeFrame,
        online,
      }: { userId: string; timeFrame: string; online: boolean }
    ) => {
      const events: Event[] = [];
      const groups: GroupWithEvents[] = [];
      const whereOnline = online ? { online: true } : {};
      const groupMembers = await prisma.groupMember.findMany({
        where: {
          userId: parseInt(userId),
        },
      });

      for (const { groupId } of groupMembers) {
        if (groupId) {
          const group = await prisma.group.findFirst({
            where: { id: groupId },
            include: {
              events: {
                where: {
                  ...whereTimeFrame(timeFrame),
                  ...whereOnline,
                },
              },
            },
          });
          if (group) groups.push(group);
        }
      }
      for (const { events: groupEvents } of groups) {
        if (groupEvents) events.push(...groupEvents);
      }

      if (timeFrame === EventTimeFrames.Past)
        return sortByStartsAt(events).reverse();
      if (timeFrame === EventTimeFrames.ThisWeek)
        return sortByStartsAt(filterByThisWeek(events)).reverse();
      return sortByStartsAt(events);
    },
  },

  Mutation: {
    async createEvent(
      _: any,
      {
        userId,
        groupId,
        input,
      }: { userId: string; groupId: string; input: EventInput }
    ) {
      const {
        name,
        description,
        location,
        startsAt,
        endsAt,
        online,
        externalLink,
        coverPhoto,
      } = input;
      let event: Event;

      try {
        event = await prisma.event.create({
          data: {
            name,
            online,
            location,
            description,
            externalLink,
            startsAt: new Date(startsAt),
            endsAt: new Date(endsAt),
            ...groupConnect(groupId),
          },
        });
      } catch {
        throw new ApolloError(Messages.events.errors.create());
      }

      try {
        await saveEventCoverPhoto(event, coverPhoto, true);
      } catch {
        await prisma.event.delete({
          where: { id: event.id },
        });
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      await prisma.eventAttendee.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          event: {
            connect: {
              id: event.id,
            },
          },
          status: AttendingStatus.Host,
        },
      });

      return { event };
    },

    async updateEvent(
      _: any,
      { id, input }: { id: string; input: EventInput }
    ) {
      const {
        name,
        description,
        location,
        startsAt,
        endsAt,
        online,
        externalLink,
        coverPhoto,
      } = input;
      let event: Event;

      try {
        event = await prisma.event.update({
          where: { id: parseInt(id) },
          data: {
            name,
            online,
            location,
            description,
            externalLink,
            startsAt: new Date(startsAt),
            endsAt: new Date(endsAt),
          },
        });
        if (!event)
          throw new ApolloError(Messages.items.notFound(TypeNames.Event));
      } catch {
        throw new ApolloError(Messages.events.errors.update());
      }

      try {
        await saveEventCoverPhoto(event, coverPhoto);
      } catch {
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { event };
    },

    async deleteEvent(_: any, { id }: { id: string }) {
      const images = await prisma.image.findMany({
        where: { eventId: parseInt(id) },
      });
      for (const image of images) {
        await deleteImage(image.path);
        await prisma.image.delete({
          where: { id: image.id },
        });
      }
      await prisma.event.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default eventResolvers;
