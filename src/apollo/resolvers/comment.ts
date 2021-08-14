import { ApolloError, GraphQLUpload } from "apollo-server-micro";
import { saveImage, deleteImage } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { Common } from "../../constants";

interface CommentInput {
  body: string;
  images: any;
}

const saveImages = async (comment: any, images: any) => {
  for (const image of images ? images : []) {
    const path = await saveImage(image);

    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: comment.userId,
          },
        },
        comment: {
          connect: {
            id: comment.id,
          },
        },
        path,
      },
    });
  }
};

const commentResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    comment: async (_: any, { id }: { id: string }) => {
      const comment = await prisma.comment.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return comment;
    },

    commentsByPostId: async (_: any, { postId }: { postId: string }) => {
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(postId) },
      });
      return comments;
    },

    commentsByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      const comments = await prisma.comment.findMany({
        where: { motionId: parseInt(motionId) },
      });
      return comments;
    },
  },

  Mutation: {
    async createComment(
      _: any,
      {
        userId,
        postId,
        motionId,
        input,
      }: {
        userId: string;
        postId: string;
        motionId: string;
        input: CommentInput;
      }
    ) {
      const { body, images } = input;
      const commentedItemConnect = postId
        ? {
            post: {
              connect: {
                id: parseInt(postId),
              },
            },
          }
        : {
            motion: {
              connect: {
                id: parseInt(motionId),
              },
            },
          };
      let comment;
      try {
        comment = await prisma.comment.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            ...commentedItemConnect,
            body,
          },
        });
      } catch (err) {
        throw new ApolloError(Messages.comments.errors.commentCreationError());
      }

      try {
        await saveImages(comment, images);
      } catch (err) {
        const currComment = {
          where: { id: comment.id },
        };
        await prisma.comment.delete(currComment);
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { comment };
    },

    async updateComment(
      _: any,
      { id, input }: { id: string; input: CommentInput }
    ) {
      const { body, images } = input;
      let comment;
      try {
        comment = await prisma.comment.update({
          where: { id: parseInt(id) },
          data: { body },
        });
      } catch (err) {
        throw new ApolloError(Messages.comments.errors.commentUpdateError());
      }

      if (!comment)
        throw new Error(Messages.items.notFound(Common.TypeNames.Comment));

      try {
        await saveImages(comment, images);
      } catch (err) {
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { comment };
    },

    async deleteComment(_: any, { id }: { id: string }) {
      const images = await prisma.image.findMany({
        where: { commentId: parseInt(id) },
      });

      for (const image of images) {
        await deleteImage(image.path);
      }

      await prisma.comment.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },
  },
};

export default commentResolvers;
