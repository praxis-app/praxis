import { GraphQLUpload } from "apollo-server-micro";
import { promisify } from "util";
import fs from "fs";

import prisma from "../../utils/initPrisma";
import saveImage from "../../utils/saveImage";
import { inDev } from "../../utils/environment";
import { Settings, Common } from "../../constants";

interface GroupInput {
  name: string;
  description: string;
  coverPhoto: any;
}

const saveCoverPhoto = async (group: any, image: any) => {
  if (image) {
    const path = await saveImage(image);
    await prisma.image.create({
      data: {
        group: {
          connect: {
            id: group.id,
          },
        },
        profilePicture: true,
        path,
      },
    });
  }
};

const groupResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    groupFeed: async (_: any, { name }: { name: string }) => {
      const feed: BackendFeedItem[] = [];

      const whereGroupId = {
        where: {
          name,
        },
      };
      const groupWithPosts = await prisma.group.findFirst({
        ...whereGroupId,
        include: {
          posts: true,
        },
      });
      const groupWithMotions = await prisma.group.findFirst({
        ...whereGroupId,
        include: {
          motions: true,
        },
      });
      const postsWithType = groupWithPosts?.posts.map((post) => ({
        ...post,
        __typename: Common.TypeNames.Post,
      }));
      const motionsWithType = groupWithMotions?.motions.map((motion) => ({
        ...motion,
        __typename: Common.TypeNames.Motion,
      }));

      feed.push(
        ...(postsWithType as BackendPost[]),
        ...(motionsWithType as BackendMotion[])
      );

      return feed.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },

    group: async (_: any, { id }: { id: string }) => {
      const group = await prisma.group.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return group;
    },

    groupByName: async (_: any, { name }: { name: string }) => {
      const group = await prisma.group.findFirst({
        where: {
          name,
        },
        include: {
          settings: true,
        },
      });
      return group;
    },

    allGroups: async () => {
      const groups = await prisma.group.findMany();
      return groups;
    },
  },

  Mutation: {
    async createGroup(
      _: any,
      { creatorId, input }: { creatorId: string; input: GroupInput }
    ) {
      const { name, description, coverPhoto } = input;
      const group = await prisma.group.create({
        data: {
          creatorId: parseInt(creatorId),
          description,
          name,
        },
      });

      await saveCoverPhoto(group, coverPhoto);

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
              id: group.id,
            },
          },
        },
      });

      const settingsStillInDev = inDev()
        ? [
            {
              name: Settings.GroupSettings.VotingType,
              value: Settings.GroupDefaults.VotingType,
            },
            {
              name: Settings.GroupSettings.VoteVerification,
              value: Settings.GroupDefaults.VoteVerification,
            },
          ]
        : [];
      const settings = [
        {
          name: Settings.GroupSettings.NoAdmin,
          value: Settings.GroupDefaults.NoAdmin,
        },
        ...settingsStillInDev,
        {
          name: Settings.GroupSettings.RatificationThreshold,
          value: Settings.GroupDefaults.RatificationThreshold,
        },
        {
          name: Settings.GroupSettings.XToPass,
          value: Settings.GroupDefaults.XToPass,
        },
        {
          name: Settings.GroupSettings.XToBlock,
          value: Settings.GroupDefaults.XToBlock,
        },
      ];
      for (const setting of settings) {
        const { name, value } = setting;
        await prisma.setting.create({
          data: {
            name,
            value,
            group: {
              connect: {
                id: group.id,
              },
            },
          },
        });
      }

      return { group };
    },

    async updateGroup(
      _: any,
      { id, input }: { id: string; input: GroupInput }
    ) {
      const { name, description, coverPhoto } = input;
      const group = await prisma.group.update({
        where: { id: parseInt(id) },
        data: { name, description },
      });

      if (!group) throw new Error("Group not found.");

      await saveCoverPhoto(group, coverPhoto);

      return { group };
    },

    async deleteGroup(_: any, { id }: { id: string }) {
      const unlinkAsync = promisify(fs.unlink);
      const whereGroupId = {
        where: { groupId: parseInt(id) },
      };
      // Deletes dependents
      await prisma.post.deleteMany(whereGroupId);
      await prisma.motion.deleteMany(whereGroupId);
      const images = await prisma.image.findMany(whereGroupId);
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
    },
  },
};

export default groupResolvers;
