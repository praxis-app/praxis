import prisma from "../../utils/initPrisma";

const likeResolvers = {
  Query: {
    likesByPostId: async (_: any, { postId }) => {
      try {
        const post = await prisma.post.findFirst({
          where: {
            id: parseInt(postId),
          },
          include: {
            likes: true,
          },
        });
        return post.likes;
      } catch (error) {
        throw error;
      }
    },

    likesByCommentId: async (_: any, { commentId }) => {
      try {
        const comment = await prisma.comment.findFirst({
          where: {
            id: parseInt(commentId),
          },
          include: {
            likes: true,
          },
        });
        return comment.likes;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createLike(_: any, { userId, postId, commentId }) {
      try {
        const likedItemConnect = postId
          ? {
              post: {
                connect: {
                  id: parseInt(postId),
                },
              },
            }
          : {
              comment: {
                connect: {
                  id: parseInt(commentId),
                },
              },
            };

        const like = await prisma.like.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            ...likedItemConnect,
          },
        });

        return { like };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteLike(_: any, { id }) {
      try {
        await prisma.like.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default likeResolvers;
