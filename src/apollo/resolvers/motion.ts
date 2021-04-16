import { GraphQLUpload } from "apollo-server-micro";
import saveImage from "../../utils/saveImage";
import prisma from "../../utils/initPrisma";

// fs, promisify, and unlink to delete img
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

interface MotionInput {
  body: string;
  action: string;
  images: any;
}

const saveImages = async (motion: any, images: any) => {
  for (const image of images ? images : []) {
    const { createReadStream, mimetype } = await image;
    const extension = mimetype.split("/")[1];
    const path = "public/uploads/" + Date.now() + "." + extension;
    await saveImage(createReadStream, path);

    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: motion.userId,
          },
        },
        motion: {
          connect: {
            id: motion.id,
          },
        },
        path: path.replace("public", ""),
      },
    });
  }
};

const motionResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    motion: async (_: any, { id }: { id: string }) => {
      try {
        const motion = await prisma.motion.findFirst({
          where: {
            id: parseInt(id),
          },
        });
        return motion;
      } catch (error) {
        throw error;
      }
    },

    motionsByUserName: async (_: any, { name }: { name: string }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            name: name,
          },
          include: {
            motions: true,
          },
        });
        return user?.motions;
      } catch (error) {
        throw error;
      }
    },

    motionsByGroupName: async (_: any, { name }: { name: string }) => {
      try {
        const group = await prisma.group.findFirst({
          where: {
            name: name,
          },
          include: {
            motions: true,
          },
        });
        return group?.motions;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createMotion(
      _: any,
      {
        userId,
        groupId,
        input,
      }: { userId: string; groupId: string; input: MotionInput }
    ) {
      const { body, action, images } = input;
      try {
        const newMotion = await prisma.motion.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            group: {
              connect: {
                id: parseInt(groupId),
              },
            },
            body,
            action,
          },
        });

        await saveImages(newMotion, images);

        return { motion: newMotion };
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateMotion(
      _: any,
      { id, input }: { id: string; input: MotionInput }
    ) {
      const { body, action, images } = input;

      try {
        const motion = await prisma.motion.update({
          where: { id: parseInt(id) },
          data: { body, action },
        });

        await saveImages(motion, images);

        if (!motion) throw new Error("Motion not found.");

        return { motion };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteMotion(_: any, { id }: { id: string }) {
      try {
        const images = await prisma.image.findMany({
          where: { motionId: parseInt(id) },
        });

        for (const image of images) {
          await unlinkAsync("public" + image.path);
          await prisma.image.delete({
            where: { id: image.id },
          });
        }

        await prisma.motion.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default motionResolvers;
