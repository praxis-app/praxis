import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";

interface VoteInput {
  body: string;
  flipState: string;
}

const voteResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    vote: async (_: any, { id }: { id: string }) => {
      try {
        const vote = await prisma.vote.findFirst({
          where: {
            id: parseInt(id),
          },
        });
        return vote;
      } catch (error) {
        throw error;
      }
    },

    votesByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      try {
        const votes = await prisma.vote.findMany({
          where: { motionId: parseInt(motionId) },
        });
        return votes;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createVote(
      _: any,
      {
        userId,
        motionId,
        input,
      }: {
        userId: string;
        motionId: string;
        input: VoteInput;
      }
    ) {
      const { body, flipState } = input;
      try {
        const vote = await prisma.vote.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            motion: {
              connect: {
                id: parseInt(motionId),
              },
            },
            body,
            flipState,
          },
        });

        return { vote };
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateVote(_: any, { id, input }: { id: string; input: VoteInput }) {
      const { body, flipState } = input;

      try {
        const vote = await prisma.vote.update({
          where: { id: parseInt(id) },
          data: { body, flipState },
        });

        if (!vote) throw new Error("Vote not found.");

        return { vote };
      } catch (err) {
        throw new Error(err);
      }
    },

    async verifyVote(_: any, { id }: { id: string }) {
      try {
        const vote = await prisma.vote.update({
          where: { id: parseInt(id) },
          data: { verified: true },
        });

        if (!vote) throw new Error("Vote not found.");

        return { vote };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteVote(_: any, { id }: { id: string }) {
      try {
        await prisma.vote.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default voteResolvers;
