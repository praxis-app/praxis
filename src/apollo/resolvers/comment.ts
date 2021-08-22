import { ApolloError, GraphQLUpload } from "apollo-server-micro";
import { saveImage, deleteImage } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";

interface CommentInput {
  body: string;
  images: any;
}

const saveImages = async (comment: any, images: any) => {
  for (const image of images ? images : []) {
    let path: any;

    try {
      path = await saveImage(image);
    } catch (e) {
      throw new ApolloError(" Unable to upload image(s)\nError response: " + e);
    }

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

      // for image upload error catching in utils/saveImage
      try {
        await saveImages(comment, images);
      } catch (e) {
        const currComment = {
          where: { id: comment.id },
        };
        await prisma.comment.delete(currComment);
        return e; // method is not allowed to return null, this prevents error at runtime
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

      // for image upload error catching in utils/saveImage
      try {
        await saveImages(comment, images);
      } catch (e) {
        return e; // method is not allowed to return null, this prevents error at runtime
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
