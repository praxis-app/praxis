import { generateRandom } from "../../utils/common";
import prisma from "../../utils/initPrisma";
import { removeExpired, timeDifference } from "../models/serverInvite";

interface ServerInviteInput {
  maxUses?: number;
  expiresAt?: string;
}

const serverInviteResolvers = {
  Query: {
    serverInvite: async (_: any, { id }: { id: string }) => {
      await removeExpired();
      const serverInvite = await prisma.serverInvite.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return serverInvite;
    },

    serverInviteByToken: async (_: any, { token }: { token: string }) => {
      const serverInvite = await prisma.serverInvite.findFirst({
        where: {
          token,
        },
      });
      return serverInvite;
    },

    allServerInvites: async () => {
      const serverInvites = await removeExpired();
      if (serverInvites.length === 0) {
        const firstInvite = await prisma.serverInvite.create({
          data: {
            user: {
              connect: {
                id: 1,
              },
            },
            token: generateRandom(),
          },
        });
        return [firstInvite];
      } else return serverInvites;
    },
  },

  Mutation: {
    async createServerInvite(
      _: any,
      {
        userId,
        input,
      }: {
        userId: string;
        input: ServerInviteInput;
      }
    ) {
      const token = generateRandom();
      const { maxUses, expiresAt } = input;
      const serverInvite = await prisma.serverInvite.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          token,
          maxUses,
          ...timeDifference(expiresAt),
        },
      });
      return { serverInvite };
    },

    async redeemServerInvite(
      _: any,
      {
        token,
      }: {
        token: string;
      }
    ) {
      await removeExpired();
      const whereToken = {
        where: {
          token,
        },
      };
      const serverInvite = await prisma.serverInvite.findFirst(whereToken);
      const newServerInvite = await prisma.serverInvite.update({
        ...whereToken,
        data: {
          uses: (serverInvite?.uses as number) + 1,
        },
      });
      return { serverInvite: newServerInvite };
    },

    async deleteServerInvite(_: any, { id }: { id: string }) {
      await prisma.serverInvite.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default serverInviteResolvers;
