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

    imagesByPostId: async (_: any, { postId }) => {
      try {
        const images = await prisma.image.findMany({
          where: { postId: parseInt(postId) },
        });
        return images;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async uploadImage(_: any, { image, userId }) {
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

    async deleteImage(_, { id }) {
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
