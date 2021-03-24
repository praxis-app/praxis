import { GraphQLUpload } from "apollo-server-micro";
import saveImage from "../../utils/saveImage";
import prisma from "../../utils/initPrisma";

// fs, promisify, and unlink to delete img
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

const saveImages = async (post: any, images: any) => {
  for (const image of images ? images : []) {
    const { createReadStream, mimetype } = await image;
    const extension = mimetype.split("/")[1];
    const path = "public/uploads/" + Date.now() + "." + extension;
    await saveImage(createReadStream, path);

    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: post.userId,
          },
        },
        post: {
          connect: {
            id: post.id,
          },
        },
        path: path.replace("public", ""),
      },
    });
  }
};

const postResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    post: async (_: any, { id }) => {
      try {
        const post = await prisma.post.findFirst({
          where: {
            id: parseInt(id),
          },
        });
        return post;
      } catch (error) {
        throw error;
      }
    },

    allPosts: async () => {
      try {
        const posts = await prisma.post.findMany();
        return posts;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createPost(_: any, { userId, input }) {
      const { body, images } = input;
      try {
        const newPost = await prisma.post.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            body: body,
          },
        });

        await saveImages(newPost, images);

        return { post: newPost };
      } catch (err) {
        throw new Error(err);
      }
    },

    async updatePost(_: any, { id, input }) {
      const { body, images } = input;

      try {
        const post = await prisma.post.update({
          where: { id: parseInt(id) },
          data: { body: body },
        });

        await saveImages(post, images);

        if (!post) throw new Error("Post not found.");

        return { post };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deletePost(_: any, { id }) {
      try {
        const images = await prisma.image.findMany({
          where: { postId: parseInt(id) },
        });

        for (const image of images) {
          await unlinkAsync("public" + image.path);
          await prisma.image.delete({
            where: { id: image.id },
          });
        }

        await prisma.post.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default postResolvers;
