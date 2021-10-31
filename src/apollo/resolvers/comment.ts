import { ApolloError, GraphQLUpload } from "apollo-server-micro";
import { Comment } from ".prisma/client";
import { sortByNewest } from "../models/common";
import { TypeNames } from "../../constants/common";
import { saveImage, deleteImage, FileUpload } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";

interface CommentInput {
  body: string;
  images: FileUpload[];
}

const saveImages = async (comment: Comment, images: FileUpload[]) => {
  for (const image of images ? images : []) {
    let path: string;

    try {
      path = await saveImage(image);
    } catch {
      throw new ApolloError(Messages.errors.imageUploadError());
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
        comments: sortByNewest(comments),
        totalComments: comments.length,
      };
    },

    commentsByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      const comments = await prisma.comment.findMany({
        where: { motionId: parseInt(motionId) },
      });
      return {
        comments: sortByNewest(comments),
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
      let comment: Comment;
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
      } catch {
        throw new ApolloError(Messages.comments.errors.create());
      }

      try {
        await saveImages(comment, images);
      } catch {
        await prisma.comment.delete({
          where: { id: comment.id },
        });
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { comment };
    },

    async updateComment(
      _: any,
      { id, input }: { id: string; input: CommentInput }
    ) {
      const { body, images } = input;
      let comment: Comment;
      try {
        comment = await prisma.comment.update({
          where: { id: parseInt(id) },
          data: { body },
        });
        if (!comment)
          throw new ApolloError(Messages.items.notFound(TypeNames.Comment));
      } catch {
        throw new ApolloError(Messages.comments.errors.update());
      }

      try {
        await saveImages(comment, images);
      } catch {
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
