import { User } from ".prisma/client";
import prisma from "../../utils/initPrisma";
import {
  FileUpload,
  randomDefaultImagePath,
  saveImage,
} from "../../utils/image";

export const saveProfilePicture = async (
  user: User,
  image?: FileUpload,
  allowRandom = false
) => {
  let path = "";
  if (allowRandom) path = randomDefaultImagePath();
  if (image) path = await saveImage(image);
  if (path) {
    await prisma.image.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        profilePicture: true,
        path,
      },
    });
  }
};
