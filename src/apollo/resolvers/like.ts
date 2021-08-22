import { ModelNames } from "../../constants/common";
import prisma from "../../utils/initPrisma";

const likeResolvers = {
  Query: {
    likesByPostId: async (_: any, { postId }: { postId: string }) => {
      const post = await prisma.post.findFirst({
        where: {
          id: parseInt(postId),
        },
        include: {
          likes: true,
        },
      });
      return post?.likes;
    },

    likesByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      const motion = await prisma.motion.findFirst({
        where: {
          id: parseInt(motionId),
        },
        include: {
          likes: true,
        },
      });
      return motion?.likes;
    },

    likesByCommentId: async (_: any, { commentId }: { commentId: string }) => {
      const comment = await prisma.comment.findFirst({
        where: {
          id: parseInt(commentId),
        },
        include: {
          likes: true,
        },
      });
      return comment?.likes;
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
      let likedItemType = ModelNames.Post,
        likedItemId: string = postId;
      if (motionId) {
        likedItemType = ModelNames.Motion;
        likedItemId = motionId;
      }
      if (commentId) {
        likedItemType = ModelNames.Comment;
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
    },

    async deleteLike(_: any, { id }: { id: string }) {
      await prisma.like.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default likeResolvers;
