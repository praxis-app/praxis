import { GraphQLUpload } from "apollo-server-micro";
import { deleteImage } from "../../utils/image";
import prisma from "../../utils/initPrisma";

const imageResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
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
    async deleteImage(_: any, { id }: { id: string }) {
      const image = await prisma.image.delete({
        where: { id: parseInt(id) },
      });
      await deleteImage(image.path);
      return true;
    },
  },
};

export default imageResolvers;
