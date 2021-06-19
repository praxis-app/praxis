import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";

const groupMemberResolvers = {
  Query: {
    groupMembers: async (_: any, { groupId }: { groupId: string }) => {
      const group = await prisma.group.findFirst({
        where: {
          id: parseInt(groupId),
        },
        include: {
          members: true,
        },
      });
      return group?.members;
    },

    memberRequests: async (_: any, { groupId }: { groupId: string }) => {
      const group = await prisma.group.findFirst({
        where: {
          id: parseInt(groupId),
        },
        include: {
          memberRequests: true,
        },
      });
      return group?.memberRequests;
    },
  },

  Mutation: {
    async createMemberRequest(
      _: any,
      { groupId, userId }: { groupId: string; userId: string }
    ) {
      const memberRequest = await prisma.memberRequest.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          group: {
            connect: {
              id: parseInt(groupId),
            },
          },
        },
      });
      return { memberRequest };
    },

    async deleteMemberRequest(_: any, { id }: { id: string }) {
      await prisma.memberRequest.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },

    async deleteGroupMember(_: any, { id }: { id: string }) {
      await prisma.groupMember.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },

    async approveMemberRequest(_: any, { id }: { id: string }) {
      const request = await prisma.memberRequest.delete({
        where: { id: parseInt(id) },
      });

      if (!request) throw new Error(Messages.groups.notFound.request());

      let groupMember;
      if (request.userId && request.groupId)
        groupMember = await prisma.groupMember.create({
          data: {
            user: {
              connect: {
                id: request.userId,
              },
            },
            group: {
              connect: {
                id: request.groupId,
              },
            },
          },
        });

      return { groupMember };
    },

    async denyMemberRequest(_: any, { id }: { id: string }) {
      const request = await prisma.memberRequest.update({
        where: { id: parseInt(id) },
        data: { status: "denied" },
      });

      if (!request) throw new Error(Messages.groups.notFound.request());

      return { request };
    },
  },
};

export default groupMemberResolvers;
