import { GraphQLUpload } from "apollo-server-micro";
import GraphQLJSON from "graphql-type-json";
import { promisify } from "util";
import fs from "fs";

import saveImage from "../../utils/saveImage";
import prisma from "../../utils/initPrisma";

interface MotionInput {
  body: string;
  action: string;
  actionData: any;
  images: any;
}

const saveImages = async (motion: any, images: any) => {
  for (const image of images ? images : []) {
    const path = await saveImage(image);
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
        path,
      },
    });
  }
};

const motionResolvers = {
  FileUpload: GraphQLUpload,
  JSON: GraphQLJSON,

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
            name,
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
            name,
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
      let { body, action, actionData, images } = input;
      try {
        if (actionData.newGroupImage) {
          const newGroupImagePath = await saveImage(actionData.newGroupImage);
          actionData = { newGroupImagePath };
        }
        const motion = await prisma.motion.create({
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
            actionData,
          },
        });

        await saveImages(motion, images);

        return { motion };
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
      const unlinkAsync = promisify(fs.unlink);

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
