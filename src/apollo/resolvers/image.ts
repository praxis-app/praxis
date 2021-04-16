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
      try {
        const images = await prisma.image.findMany();
        return images;
      } catch (error) {
        throw error;
      }
    },

    imagesByPostId: async (_: any, { postId }: { postId: string }) => {
      try {
        const images = await prisma.image.findMany({
          where: { postId: parseInt(postId) },
        });
        return images;
      } catch (error) {
        throw error;
      }
    },

    imagesByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      try {
        const images = await prisma.image.findMany({
          where: { motionId: parseInt(motionId) },
        });
        return images;
      } catch (error) {
        throw error;
      }
    },

    imagesByCommentId: async (_: any, { commentId }: { commentId: string }) => {
      try {
        const images = await prisma.image.findMany({
          where: { commentId: parseInt(commentId) },
        });
        return images;
      } catch (error) {
        throw error;
      }
    },

    profilePictures: async (_: any, { userId }: { userId: string }) => {
      try {
        const profilePictures = await prisma.image.findMany({
          where: { userId: parseInt(userId), profilePicture: true },
        });
        return profilePictures;
      } catch (error) {
        throw error;
      }
    },

    currentProfilePicture: async (_: any, { userId }: { userId: string }) => {
      try {
        const profilePictures = await prisma.image.findMany({
          where: { userId: parseInt(userId), profilePicture: true },
        });
        const currentProfilePicture = profilePictures.length
          ? profilePictures[profilePictures.length - 1]
          : null;
        return currentProfilePicture;
      } catch (error) {
        throw error;
      }
    },

    currentCoverPhoto: async (_: any, { groupId }: { groupId: string }) => {
      try {
        const coverPhotos = await prisma.image.findMany({
          where: { groupId: parseInt(groupId), profilePicture: true },
        });
        const currentCoverPhoto = coverPhotos.length
          ? coverPhotos[coverPhotos.length - 1]
          : null;
        return currentCoverPhoto;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async uploadImage(
      _: any,
      { image, userId }: { image: any; userId: string }
    ) {
      try {
        const { createReadStream, mimetype } = await image;
        const extension = mimetype.split("/")[1];
        const path = "public/uploads/" + Date.now() + "." + extension;
        await saveImage(createReadStream, path);

        const newImage = await prisma.image.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            path: path.replace("public", ""),
          },
        });

        return { image: newImage };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteImage(_: any, { id }: { id: string }) {
      try {
        const image = await prisma.image.delete({
          where: { id: parseInt(id) },
        });
        await unlinkAsync("public" + image.path);
        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default imageResolvers;
