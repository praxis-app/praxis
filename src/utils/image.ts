import { promisify } from "util";
import fs, { createWriteStream, ReadStream } from "fs";
import { DEFAULT_IMAGES_SIZE, UPLOADS_PATH } from "../constants/image";
import { DirectoryNames } from "../constants/common";

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream;
}

export const saveImage = async (image: FileUpload): Promise<string> => {
  const { createReadStream, mimetype } = await image;
  const extension = mimetype.split("/")[1];
  const path = UPLOADS_PATH + Date.now() + "." + extension;

  await new Promise((resolve, reject) => {
    const stream = createReadStream();

    stream
      .on("error", (error: Error) => {
        fs.unlink(path, () => {
          reject(error);
        });
      })
      .pipe(createWriteStream(path))
      .on("error", reject)
      .on("finish", resolve);
  });

  return path.replace(DirectoryNames.Public, "");
};

export const deleteImage = async (path: string) => {
  const unlinkAsync = promisify(fs.unlink);
  if (path.includes(DirectoryNames.Uploads))
    await unlinkAsync(DirectoryNames.Public + path);
};

export const randomDefaultImagePath = (): string => {
  return `/${DirectoryNames.Defaults}/${
    Math.floor(Math.random() * DEFAULT_IMAGES_SIZE) + 1
  }.jpeg`;
};
