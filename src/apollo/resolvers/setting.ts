import { ApolloError, GraphQLUpload } from "apollo-server-micro";
import { Setting } from ".prisma/client";

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
      return settings.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
    },
  },

  Mutation: {
    async updateSettings(_: any, { input }: { input: UpdateSettingsInput }) {
      const { settings } = input;
      const updatedSettings: Setting[] = [];

      for (const setting of settings) {
        const updatedSetting = await updateSettingById(setting);
        if (!updatedSetting)
          throw new ApolloError(Messages.items.notFound(TypeNames.Setting));
        updatedSettings.push(updatedSetting);
      }

      return { settings: updatedSettings };
    },
  },
};

export default settingResolvers;
