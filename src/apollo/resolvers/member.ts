import prisma from "../../utils/initPrisma";

const memberResolvers = {
  Query: {
    groupMembers: async (_: any, { groupId }: { groupId: string }) => {
      try {
        const group = await prisma.group.findFirst({
          where: {
            id: parseInt(groupId),
          },
          include: {
            members: true,
          },
        });
        return group?.members;
      } catch (error) {
        throw error;
      }
    },

    memberRequests: async (_: any, { groupId }: { groupId: string }) => {
      try {
        const group = await prisma.group.findFirst({
          where: {
            id: parseInt(groupId),
          },
          include: {
            memberRequests: true,
          },
        });
        return group?.memberRequests;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createMemberRequest(
      _: any,
      { groupId, userId }: { groupId: string; userId: string }
    ) {
      try {
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
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteMemberRequest(_: any, { id }: { id: string }) {
      try {
        await prisma.memberRequest.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteGroupMember(_: any, { id }: { id: string }) {
      try {
        await prisma.groupMember.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },

    async approveMemberRequest(_: any, { id }: { id: string }) {
      try {
        const request = await prisma.memberRequest.delete({
          where: { id: parseInt(id) },
        });

        if (!request) throw new Error("Request not found.");

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
      } catch (err) {
        throw new Error(err);
      }
    },

    async denyMemberRequest(_: any, { id }: { id: string }) {
      try {
        const request = await prisma.memberRequest.update({
          where: { id: parseInt(id) },
          data: { status: "denied" },
        });

        if (!request) throw new Error("Request not found.");

        return { request };
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default memberResolvers;
