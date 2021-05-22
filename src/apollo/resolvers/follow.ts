import prisma from "../../utils/initPrisma";

const followResolvers = {
  Query: {
    userFollowers: async (_: any, { userId }: { userId: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          id: parseInt(userId),
        },
        include: {
          followers: true,
        },
      });
      return user?.followers;
    },

    userFollowersByName: async (_: any, { name }: { name: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          name,
        },
        include: {
          followers: true,
        },
      });
      return user?.followers;
    },

    userFollowing: async (_: any, { userId }: { userId: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          id: parseInt(userId),
        },
        include: {
          following: true,
        },
      });
      return user?.following;
    },

    userFollowingByName: async (_: any, { name }: { name: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          name,
        },
        include: {
          following: true,
        },
      });
      return user?.following;
    },
  },

  Mutation: {
    async createFollow(
      _: any,
      { userId, followerId }: { userId: string; followerId: string }
    ) {
      const follow = await prisma.follow.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          follower: {
            connect: {
              id: parseInt(followerId),
            },
          },
        },
      });

      return { follow };
    },

    async deleteFollow(_: any, { id }: { id: string }) {
      await prisma.follow.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default followResolvers;
