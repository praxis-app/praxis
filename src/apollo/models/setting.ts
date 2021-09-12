import { Setting } from ".prisma/client";
import { GroupSettings } from "../../constants/setting";
import prisma from "../../utils/initPrisma";

export const groupSettingByName = (
  settings: Setting[],
  name: GroupSettings
): string => {
  const setting = settings.find((setting) => setting.name === name);
  return setting?.value as string;
};

export const updateSettingById = async ({
  id,
  value,
}: SettingInput): Promise<Setting> => {
  const setting = await prisma.setting.update({
    where: { id: parseInt(id) },
    data: { value },
  });
  return setting;
};
