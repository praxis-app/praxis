import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";
import { saveImage, deleteImage } from "../../utils/image";
import { ModelNames, TypeNames } from "../../constants/common";
import { GroupDefaults, GroupSettings } from "../../constants/setting";
import Messages from "../../utils/messages";
import { paginate } from "../../utils/items";

interface GroupInput {
  name: string;
  description: string;
  coverPhoto: any;
}

interface GroupFeedInput extends PaginationState {
  name: string;
  itemType: string;
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
        feed.push(...(postsWithType as BackendPost[]));
      if (!itemType || itemType === ModelNames.Motion)
        feed.push(...(motionsWithType as BackendMotion[]));

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

      const settings = [
        {
          name: GroupSettings.NoAdmin,
          value: GroupDefaults.NoAdmin,
        },
        {
          name: GroupSettings.VotingType,
          value: GroupDefaults.VotingType,
        },
        {
          name: GroupSettings.VoteVerification,
          value: GroupDefaults.VoteVerification,
        },
        {
          name: GroupSettings.ReservationsLimit,
          value: GroupDefaults.ReservationsLimit,
        },
        {
          name: GroupSettings.StandAsidesLimit,
          value: GroupDefaults.StandAsidesLimit,
        },
        {
          name: GroupSettings.RatificationThreshold,
          value: GroupDefaults.RatificationThreshold,
        },
        {
          name: GroupSettings.XToPass,
          value: GroupDefaults.XToPass,
        },
        {
          name: GroupSettings.XToBlock,
          value: GroupDefaults.XToBlock,
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
