import { ApolloError, GraphQLUpload } from "apollo-server-micro";
import { Comment } from ".prisma/client";

import { saveImage, deleteImage, FileUpload } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";

interface CommentInput {
  body: string;
  images: FileUpload[];
}

const saveImages = async (comment: Comment, images: FileUpload[]) => {
  for (const image of images ? images : []) {
    let path: string;

    try {
      path = await saveImage(image);
    } catch (err) {
      throw new ApolloError(
        "Unable to upload image(s)\nError response: " + err
      );
    }

    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: comment.userId as number,
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

      return {
        comments,
        totalComments: comments.length,
      };
    },

    commentsByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      const comments = await prisma.comment.findMany({
        where: { motionId: parseInt(motionId) },
      });

      return {
        comments,
        totalComments: comments.length,
      };
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
      const comment = await prisma.comment.create({
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

      try {
        await saveImages(comment, images);
      } catch (err) {
        const whereCommentId = {
          where: { id: comment.id },
        };
        await prisma.comment.delete(whereCommentId);
        return err;
      }

      return { comment };
    },

    async updateComment(
      _: any,
      { id, input }: { id: string; input: CommentInput }
    ) {
      const { body, images } = input;
      const comment = await prisma.comment.update({
        where: { id: parseInt(id) },
        data: { body },
      });

      if (!comment) throw new Error(Messages.items.notFound(TypeNames.Comment));

      try {
        await saveImages(comment, images);
      } catch (err) {
        return err;
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
