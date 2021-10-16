import { Group } from ".prisma/client";
import prisma from "../../utils/initPrisma";
import {
  saveImage,
  FileUpload,
  randomDefaultImagePath,
} from "../../utils/image";
import { ImageVariety } from "../../constants/image";

export const saveGroupCoverPhoto = async (
  group: Group,
  image?: FileUpload,
  allowRandom = false
) => {
  let path = "";
  if (allowRandom) path = randomDefaultImagePath();
  if (image) path = await saveImage(image);
  if (path) {
    await prisma.image.create({
      data: {
        group: {
          connect: {
            id: group.id,
          },
        },
        variety: ImageVariety.CoverPhoto,
        path,
      },
    });
  }
};
