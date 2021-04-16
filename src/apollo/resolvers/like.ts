import prisma from "../../utils/initPrisma";

const likeResolvers = {
  Query: {
    likesByPostId: async (_: any, { postId }: { postId: string }) => {
      try {
        const post = await prisma.post.findFirst({
          where: {
            id: parseInt(postId),
          },
          include: {
            likes: true,
          },
        });
        return post?.likes;
      } catch (error) {
        throw error;
      }
    },

    likesByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      try {
        const motion = await prisma.motion.findFirst({
          where: {
            id: parseInt(motionId),
          },
          include: {
            likes: true,
          },
        });
        return motion?.likes;
      } catch (error) {
        throw error;
      }
    },

    likesByCommentId: async (_: any, { commentId }: { commentId: string }) => {
      try {
        const comment = await prisma.comment.findFirst({
          where: {
            id: parseInt(commentId),
          },
          include: {
            likes: true,
          },
        });
        return comment?.likes;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createLike(
      _: any,
      {
        userId,
        postId,
        motionId,
        commentId,
      }: { userId: string; postId: string; motionId: string; commentId: string }
    ) {
      try {
        let likedItemType: string = "post",
          likedItemId: string = postId;
        if (motionId) {
          likedItemType = "motion";
          likedItemId = motionId;
        }
        if (commentId) {
          likedItemType = "comment";
          likedItemId = commentId;
        }
        const like = await prisma.like.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            [likedItemType]: {
              connect: {
                id: parseInt(likedItemId),
              },
            },
          },
        });
        return { like };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteLike(_: any, { id }: { id: string }) {
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
