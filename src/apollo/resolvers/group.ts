import { GraphQLUpload } from "apollo-server-micro";
import { Group, Motion, Post } from ".prisma/client";

import prisma from "../../utils/initPrisma";
import {
  saveImage,
  deleteImage,
  FileUpload,
  randomDefaultImagePath,
} from "../../utils/image";
import { ModelNames, TypeNames } from "../../constants/common";
import { INITIAL_GROUP_SETTINGS } from "../../constants/setting";
import Messages from "../../utils/messages";
import { paginate } from "../../utils/items";
import { BackendFeedItem } from "../models/common";

interface GroupInput {
  name: string;
  description: string;
  coverPhoto: FileUpload;
}

interface GroupFeedInput extends PaginationState {
  name: string;
  itemType: string;
}

const saveCoverPhoto = async (
  group: Group,
  image: FileUpload,
  isCreatingGroup = false
) => {
  if (image || isCreatingGroup) {
    let path = randomDefaultImagePath();
    if (image) path = await saveImage(image);

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
    groupFeed: async (
      _: any,
      { name, currentPage, pageSize, itemType }: GroupFeedInput
    ) => {
      const feed: BackendFeedItem[] = [];

      const whereGroupName = {
        where: {
          name,
        },
      };
      const groupWithPosts = await prisma.group.findFirst({
        ...whereGroupName,
        include: {
          posts: true,
        },
      });
      const groupWithMotions = await prisma.group.findFirst({
        ...whereGroupName,
        include: {
          motions: true,
        },
      });
      const postsWithType = groupWithPosts?.posts.map((post) => ({
        ...post,
        __typename: TypeNames.Post,
      }));
      const motionsWithType = groupWithMotions?.motions.map((motion) => ({
        ...motion,
        __typename: TypeNames.Motion,
      }));

      if (!itemType || itemType === ModelNames.Post)
        feed.push(...(postsWithType as Post[]));
      if (!itemType || itemType === ModelNames.Motion)
        feed.push(...(motionsWithType as Motion[]));

      return {
        pagedItems: paginate(
          feed.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
          currentPage,
          pageSize
        ),
        totalItems: feed.length,
      };
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

    joinedGroupsByUserId: async (_: any, { userId }: { userId: string }) => {
      const groups: Group[] = [];
      const groupMembers = await prisma.groupMember.findMany({
        where: {
          userId: parseInt(userId),
        },
      });
      for (const { groupId } of groupMembers) {
        if (groupId) {
          const whereGroupId = {
            where: {
              id: groupId,
            },
          };
          const group = await prisma.group.findFirst(whereGroupId);
          if (group) groups.push(group);
        }
      }
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
      await saveCoverPhoto(group, coverPhoto, true);
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

      for (const setting of INITIAL_GROUP_SETTINGS) {
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

      if (!group) throw new Error(Messages.items.notFound(TypeNames.Group));

      await saveCoverPhoto(group, coverPhoto);

      return { group };
    },

    async deleteGroup(_: any, { id }: { id: string }) {
      const whereGroupId = {
        where: { groupId: parseInt(id) },
      };
      await prisma.post.deleteMany(whereGroupId);
      await prisma.motion.deleteMany(whereGroupId);
      const images = await prisma.image.findMany(whereGroupId);
      for (const image of images) {
        await deleteImage(image.path);
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
