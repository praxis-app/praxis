import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";
import { Common } from "../../constants";
import Messages from "../../utils/messages";
import Motion from "../models/motion";

interface VoteInput {
  body: string;
  flipState: string;
  consensusState: string;
}

const voteResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    vote: async (_: any, { id }: { id: string }) => {
      const vote = await prisma.vote.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return vote;
    },

    votesByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      const votes = await prisma.vote.findMany({
        where: { motionId: parseInt(motionId) },
      });
      return votes;
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
      const { body, flipState, consensusState } = input;
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
          consensusState,
        },
      });

      const motionRatified = Motion.evaluate(parseInt(motionId));

      return { vote, motionRatified };
    },

    async updateVote(_: any, { id, input }: { id: string; input: VoteInput }) {
      const { body, flipState, consensusState } = input;
      const vote = await prisma.vote.update({
        where: { id: parseInt(id) },
        data: { body, flipState, consensusState },
      });
      if (!vote)
        throw new Error(Messages.items.notFound(Common.TypeNames.Vote));

      const motionRatified = Motion.evaluate(vote.motionId as number);
      return { vote, motionRatified };
    },

    async verifyVote(_: any, { id }: { id: string }) {
      const vote = await prisma.vote.update({
        where: { id: parseInt(id) },
        data: { verified: true },
      });
      if (!vote)
        throw new Error(Messages.items.notFound(Common.TypeNames.Vote));

      return { vote };
    },

    async deleteVote(_: any, { id }: { id: string }) {
      await prisma.vote.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default voteResolvers;
