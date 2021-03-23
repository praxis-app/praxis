import prisma from "../../utils/initPrisma";

const followResolvers = {
  Query: {
    userFollowers: async (_: any, { userId }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            id: parseInt(userId),
          },
          include: {
            followers: true,
          },
        });
        return user.followers;
      } catch (error) {
        throw error;
      }
    },

    userFollowersByName: async (_: any, { name }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            name,
          },
          include: {
            followers: true,
          },
        });
        return user.followers;
      } catch (error) {
        throw error;
      }
    },

    userFollowing: async (_: any, { userId }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            id: parseInt(userId),
          },
          include: {
            following: true,
          },
        });
        return user.following;
      } catch (error) {
        throw error;
      }
    },

    userFollowingByName: async (_: any, { name }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            name,
          },
          include: {
            following: true,
          },
        });
        return user.following;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createFollow(_: any, { userId, followerId }) {
      try {
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
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteFollow(_: any, { id }) {
      try {
        await prisma.follow.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default followResolvers;
