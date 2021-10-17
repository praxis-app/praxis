import prisma from "../../utils/initPrisma";

const eventAttendeeResolvers = {
  Query: {
    eventAttendees: async (_: any, { eventId }: { eventId: string }) => {
      const event = await prisma.event.findFirst({
        where: {
          id: parseInt(eventId),
        },
        include: {
          attendees: true,
        },
      });
      return event?.attendees;
    },
  },

  Mutation: {
    async createEventAttendee(
      _: any,
      {
        eventId,
        userId,
        input: { status },
      }: { eventId: string; userId: string; input: { status: string } }
    ) {
      const eventAttendee = await prisma.eventAttendee.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          event: {
            connect: {
              id: parseInt(eventId),
            },
          },
          status,
        },
      });
      return { eventAttendee };
    },

    async deleteEventAttendee(_: any, { id }: { id: string }) {
      await prisma.eventAttendee.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default eventAttendeeResolvers;
