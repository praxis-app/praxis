import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";

interface SettingInput {
  settings: Setting[];
}

const settingResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    settingsByUserId: async (_: any, { userId }: { userId: string }) => {
      const settings = await prisma.setting.findMany({
        where: {
          userId: parseInt(userId),
        },
      });
      return settings;
    },

    settingsByGroupId: async (_: any, { groupId }: { groupId: string }) => {
      const settings = await prisma.setting.findMany({
        where: {
          groupId: parseInt(groupId),
        },
      });
      return settings;
    },
  },

  Mutation: {
    async updateSettings(_: any, { input }: { input: SettingInput }) {
      const { settings } = input;
      let updatedSettings: BackendSetting[] = [];

      for (const setting of settings) {
        const { id, value } = setting;
        const updatedSetting = await prisma.setting.update({
          where: { id: parseInt(id) },
          data: { value },
        });

        if (!updatedSetting)
          throw new Error(Messages.items.notFound(TypeNames.Setting));

        updatedSettings = [...updatedSettings, updatedSetting];
      }

      return { settings: updatedSettings };
    },
  },
};

export default settingResolvers;
