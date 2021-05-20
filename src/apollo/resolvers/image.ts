import { GraphQLUpload } from "apollo-server-micro";
import saveImage from "../../utils/saveImage";
import prisma from "../../utils/initPrisma";

// fs, promisify, and unlink to delete img
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

const imageResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    allImages: async () => {
      const images = await prisma.image.findMany();
      return images;
    },

    imagesByPostId: async (_: any, { postId }: { postId: string }) => {
      const images = await prisma.image.findMany({
        where: { postId: parseInt(postId) },
      });
      return images;
    },

    imagesByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      const images = await prisma.image.findMany({
        where: { motionId: parseInt(motionId) },
      });
      return images;
    },

    imagesByCommentId: async (_: any, { commentId }: { commentId: string }) => {
      const images = await prisma.image.findMany({
        where: { commentId: parseInt(commentId) },
      });
      return images;
    },

    profilePictures: async (_: any, { userId }: { userId: string }) => {
      const profilePictures = await prisma.image.findMany({
        where: { userId: parseInt(userId), profilePicture: true },
      });
      return profilePictures;
    },

    currentProfilePicture: async (_: any, { userId }: { userId: string }) => {
      const profilePictures = await prisma.image.findMany({
        where: { userId: parseInt(userId), profilePicture: true },
      });
      const currentProfilePicture = profilePictures.length
        ? profilePictures[profilePictures.length - 1]
        : null;
      return currentProfilePicture;
    },

    currentCoverPhoto: async (_: any, { groupId }: { groupId: string }) => {
      const coverPhotos = await prisma.image.findMany({
        where: { groupId: parseInt(groupId), profilePicture: true },
      });
      const currentCoverPhoto = coverPhotos.length
        ? coverPhotos[coverPhotos.length - 1]
        : null;
      return currentCoverPhoto;
    },
  },

  Mutation: {
    async uploadImage(
      _: any,
      { image, userId }: { image: any; userId: string }
    ) {
      const path = await saveImage(image);
      const newImage = await prisma.image.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          path,
        },
      });

      return { image: newImage };
    },

    async deleteImage(_: any, { id }: { id: string }) {
      const image = await prisma.image.delete({
        where: { id: parseInt(id) },
      });
      await unlinkAsync("public" + image.path);
      return true;
    },
  },
};

export default imageResolvers;
