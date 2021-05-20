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
      const motion = await prisma.motion.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return motion;
    },

    motionsByUserName: async (_: any, { name }: { name: string }) => {
      const user = await prisma.user.findFirst({
        where: {
          name,
        },
        include: {
          motions: true,
        },
      });
      return user?.motions;
    },

    motionsByGroupName: async (_: any, { name }: { name: string }) => {
      const group = await prisma.group.findFirst({
        where: {
          name,
        },
        include: {
          motions: true,
        },
      });
      return group?.motions;
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
      const { body, action, actionData: _actionData, images } = input;
      let actionData = _actionData;

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
    },

    async updateMotion(
      _: any,
      { id, input }: { id: string; input: MotionInput }
    ) {
      const { body, action, images } = input;
      const motion = await prisma.motion.update({
        where: { id: parseInt(id) },
        data: { body, action },
      });

      if (!motion) throw new Error("Motion not found.");

      await saveImages(motion, images);

      return { motion };
    },

    async deleteMotion(_: any, { id }: { id: string }) {
      const unlinkAsync = promisify(fs.unlink);

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
    },
  },
};

export default motionResolvers;
