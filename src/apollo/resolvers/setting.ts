import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";

interface SettingInput {
  settings: Setting[];
}

const settingResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    settingsByUserId: async (_: any, { userId }: { userId: string }) => {
      try {
        const settings = await prisma.setting.findMany({
          where: {
            userId: parseInt(userId),
          },
        });
        return settings;
      } catch (error) {
        throw error;
      }
    },

    settingsByGroupId: async (_: any, { groupId }: { groupId: string }) => {
      try {
        const settings = await prisma.setting.findMany({
          where: {
            groupId: parseInt(groupId),
          },
        });
        return settings;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async updateSettings(_: any, { input }: { input: SettingInput }) {
      const { settings } = input;
      let updatedSettings: BackendSetting[] = [];

      for (const setting of settings) {
        const { id, value } = setting;
        try {
          const updatedSetting = await prisma.setting.update({
            where: { id: parseInt(id) },
            data: { value },
          });

          if (!updatedSetting) throw new Error("Setting not found.");

          updatedSettings = [...updatedSettings, updatedSetting];
        } catch (err) {
          throw new Error(err);
        }
      }

      return { settings: updatedSettings };
    },
  },
};

export default settingResolvers;
