import { GraphQLUpload } from "apollo-server-micro";
import saveImage from "../../utils/saveImage";
import prisma from "../../utils/initPrisma";

// fs, promisify, and unlink to delete img
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

interface GroupInput {
  name: string;
  description: string;
  coverPhoto: any;
}

const saveCoverPhoto = async (group: any, image: any) => {
  if (image) {
    const { createReadStream, mimetype } = await image;
    const extension = mimetype.split("/")[1];
    const path = "public/uploads/" + Date.now() + "." + extension;
    await saveImage(createReadStream, path);

    await prisma.image.create({
      data: {
        group: {
          connect: {
            id: group.id,
          },
        },
        profilePicture: true,
        path: path.replace("public", ""),
      },
    });
  }
};

const groupResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    group: async (_: any, { id }: { id: string }) => {
      try {
        const group = await prisma.group.findFirst({
          where: {
            id: parseInt(id),
          },
        });
        return group;
      } catch (error) {
        throw error;
      }
    },

    groupByName: async (_: any, { name }: { name: string }) => {
      try {
        const group = await prisma.group.findFirst({
          where: {
            name,
          },
        });
        return group;
      } catch (error) {
        throw error;
      }
    },

    allGroups: async () => {
      try {
        const groups = await prisma.group.findMany();
        return groups;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createGroup(
      _: any,
      { creatorId, input }: { creatorId: string; input: GroupInput }
    ) {
      const { name, description, coverPhoto } = input;
      try {
        const newGroup = await prisma.group.create({
          data: {
            creatorId: parseInt(creatorId),
            description,
            name,
          },
        });

        await saveCoverPhoto(newGroup, coverPhoto);

        // Adds creator as member
        await prisma.groupMember.create({
          data: {
            user: {
              connect: {
                id: parseInt(creatorId),
              },
            },
            group: {
              connect: {
                id: newGroup.id,
              },
            },
          },
        });

        return { group: newGroup };
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateGroup(
      _: any,
      { id, input }: { id: string; input: GroupInput }
    ) {
      const { name, description, coverPhoto } = input;

      try {
        const group = await prisma.group.update({
          where: { id: parseInt(id) },
          data: { name, description },
        });

        await saveCoverPhoto(group, coverPhoto);

        if (!group) throw new Error("Group not found.");

        return { group };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteGroup(_: any, { id }: { id: string }) {
      try {
        const images = await prisma.image.findMany({
          where: { groupId: parseInt(id) },
        });

        for (const image of images) {
          await unlinkAsync("public" + image.path);
          await prisma.image.delete({
            where: { id: image.id },
          });
        }

        await prisma.group.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default groupResolvers;
