import { GraphQLUpload, ApolloError } from "apollo-server-micro";
import GraphQLJSON from "graphql-type-json";
import { Motion } from ".prisma/client";

import { saveImage, deleteImage, FileUpload } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";

interface MotionInput {
  body: string;
  action: string;
  actionData: any;
  images: FileUpload[];
}

const saveImages = async (motion: Motion, images: FileUpload[]) => {
  for (const image of images ? images : []) {
    const path = await saveImage(image);
    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: motion.userId as number,
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
      let motion: Motion;

      if (actionData?.groupImage) {
        const groupImagePath = await saveImage(actionData.groupImage);
        actionData = { groupImagePath };
      }

      if (actionData?.groupEvent?.coverPhoto) {
        const coverPhotoPath = await saveImage(
          actionData.groupEvent.coverPhoto
        );
        actionData = {
          groupEvent: { ...actionData.groupEvent, coverPhotoPath },
        };
      }

      try {
        motion = await prisma.motion.create({
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
      } catch {
        throw new ApolloError(Messages.motions.errors.create());
      }

      try {
        await saveImages(motion, images);
      } catch {
        await prisma.motion.delete({
          where: { id: motion.id },
        });
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { motion };
    },

    async updateMotion(
      _: any,
      { id, input }: { id: string; input: MotionInput }
    ) {
      const { body, action, images } = input;
      let motion: Motion;

      try {
        motion = await prisma.motion.update({
          where: { id: parseInt(id) },
          data: { body, action },
        });
        if (!motion)
          throw new ApolloError(Messages.items.notFound(TypeNames.Motion));
      } catch {
        throw new ApolloError(Messages.motions.errors.update());
      }

      try {
        await saveImages(motion, images);
      } catch {
        throw new ApolloError(Messages.errors.imageUploadError());
      }

      return { motion };
    },

    async deleteMotion(_: any, { id }: { id: string }) {
      const images = await prisma.image.findMany({
        where: { motionId: parseInt(id) },
      });

      for (const image of images) {
        await deleteImage(image.path);
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
