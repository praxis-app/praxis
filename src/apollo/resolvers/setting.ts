import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";
import { updateSettingById } from "../models/setting";

interface UpdateSettingsInput {
  settings: SettingInput[];
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
    async updateSettings(_: any, { input }: { input: UpdateSettingsInput }) {
      const { settings } = input;
      const updatedSettings: BackendSetting[] = [];

      for (const setting of settings) {
        const updatedSetting = await updateSettingById(setting);
        if (!updatedSetting)
          throw new Error(Messages.items.notFound(TypeNames.Setting));
        updatedSettings.push(updatedSetting);
      }

      return { settings: updatedSettings };
    },
  },
};

export default settingResolvers;
