import { GraphQLUpload } from "apollo-server-micro";
import saveImage from "../../utils/saveImage";
import prisma from "../../utils/initPrisma";

// fs, promisify, and unlink to delete img
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

interface PostInput {
  body: string;
  images: any;
}

const saveImages = async (post: any, images: any) => {
  for (const image of images ? images : []) {
    const path = await saveImage(image);
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
        path,
      },
    });
  }
};

const postResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    post: async (_: any, { id }: { id: string }) => {
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

    postsByUserName: async (_: any, { name }: { name: string }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            name: name,
          },
          include: {
            posts: true,
          },
        });
        return user?.posts;
      } catch (error) {
        throw error;
      }
    },

    postsByGroupName: async (_: any, { name }: { name: string }) => {
      try {
        const group = await prisma.group.findFirst({
          where: {
            name: name,
          },
          include: {
            posts: true,
          },
        });
        return group?.posts;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createPost(
      _: any,
      {
        userId,
        groupId,
        input,
      }: { userId: string; groupId: string; input: PostInput }
    ) {
      const { body, images } = input;
      try {
        const groupData = {
          group: {
            connect: {
              id: parseInt(groupId),
            },
          },
        };
        const newPost = await prisma.post.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            ...(groupId && groupData),
            body: body,
          },
        });

        await saveImages(newPost, images);

        return { post: newPost };
      } catch (err) {
        throw new Error(err);
      }
    },

    async updatePost(_: any, { id, input }: { id: string; input: PostInput }) {
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

    async deletePost(_: any, { id }: { id: string }) {
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
