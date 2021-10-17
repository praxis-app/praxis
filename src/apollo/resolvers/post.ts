import { ApolloError, GraphQLUpload } from "apollo-server-micro";
import { Post } from ".prisma/client";

import { saveImage, deleteImage, FileUpload } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";
import { groupConnect } from "../models/group";
import { eventConnect } from "../models/event";

interface PostInput {
  body: string;
  images: FileUpload[];
}

const saveImages = async (post: Post, images: FileUpload[]) => {
  for (const image of images ? images : []) {
    const path = await saveImage(image);

    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: post.userId as number,
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
      const post = await prisma.post.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return post;
    },

    postsByUserName: async (_: any, { name }: { name: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          name,
        },
        include: {
          posts: true,
        },
      });
      return user?.posts;
    },

    postsByGroupName: async (_: any, { name }: { name: string }) => {
      const group = await prisma.group.findFirst({
        where: {
          name,
        },
        include: {
          posts: true,
        },
      });
      return group?.posts;
    },
  },

  Mutation: {
    async createPost(
      _: any,
      {
        userId,
        groupId,
        eventId,
        input,
      }: { userId: string; groupId: string; eventId: string; input: PostInput }
    ) {
      let post: Post;
      const { body, images } = input;
      try {
        post = await prisma.post.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            ...groupConnect(groupId),
            ...eventConnect(eventId),
            body,
          },
        });
      } catch {
        throw new ApolloError(Messages.posts.errors.create());
      }

      try {
        await saveImages(post, images);
      } catch {
        await prisma.post.delete({
          where: { id: post.id },
        });
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { post };
    },

    async updatePost(_: any, { id, input }: { id: string; input: PostInput }) {
      const { body, images } = input;
      let post: Post;
      try {
        post = await prisma.post.update({
          where: { id: parseInt(id) },
          data: { body },
        });
        if (!post)
          throw new ApolloError(Messages.items.notFound(TypeNames.Post));
      } catch {
        throw new ApolloError(Messages.posts.errors.update());
      }

      try {
        await saveImages(post, images);
      } catch {
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { post };
    },

    async deletePost(_: any, { id }: { id: string }) {
      const images = await prisma.image.findMany({
        where: { postId: parseInt(id) },
      });

      for (const image of images) {
        await deleteImage(image.path);
      }

      // TODO: cascading deletes are not deleting Like entries, requires further investigation
      await prisma.like.deleteMany({
        where: { postId: parseInt(id) || null },
      });

      await prisma.post.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },
  },
};

export default postResolvers;
