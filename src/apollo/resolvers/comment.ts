import { GraphQLUpload } from "apollo-server-micro";
import saveImage from "../../utils/saveImage";
import prisma from "../../utils/initPrisma";

// fs, promisify, and unlink to delete img
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

interface CommentInput {
  body: string;
  images: any;
}

const saveImages = async (comment: any, images: any) => {
  for (const image of images ? images : []) {
    const { createReadStream, mimetype } = await image;
    const extension = mimetype.split("/")[1];
    const path = "public/uploads/" + Date.now() + "." + extension;
    await saveImage(createReadStream, path);

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
        path: path.replace("public", ""),
      },
    });
  }
};

const commentResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    comment: async (_: any, { id }: { id: string }) => {
      try {
        const comment = await prisma.comment.findFirst({
          where: {
            id: parseInt(id),
          },
        });
        return comment;
      } catch (error) {
        throw error;
      }
    },

    commentsByPostId: async (_: any, { postId }: { postId: string }) => {
      try {
        const comments = await prisma.comment.findMany({
          where: { postId: parseInt(postId) },
        });
        return comments;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createComment(
      _: any,
      {
        userId,
        postId,
        input,
      }: {
        userId: string;
        postId: string;
        input: CommentInput;
      }
    ) {
      const { body, images } = input;
      try {
        const comment = await prisma.comment.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            post: {
              connect: {
                id: parseInt(postId),
              },
            },
            body: body,
          },
        });

        await saveImages(comment, images);

        return { comment };
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateComment(
      _: any,
      { id, input }: { id: string; input: CommentInput }
    ) {
      const { body, images } = input;

      try {
        const comment = await prisma.comment.update({
          where: { id: parseInt(id) },
          data: { body: body },
        });

        await saveImages(comment, images);

        if (!comment) throw new Error("Comment not found.");

        return { comment };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteComment(_: any, { id }: { id: string }) {
      try {
        const images = await prisma.image.findMany({
          where: { commentId: parseInt(id) },
        });

        for (const image of images) {
          await unlinkAsync("public" + image.path);
          await prisma.image.delete({
            where: { id: image.id },
          });
        }

        await prisma.comment.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default commentResolvers;
