import { promisify } from "util";
import fs, { createWriteStream, ReadStream } from "fs";
import { PUBLIC_DIR_NAME, UPLOADS_PATH } from "../constants/image";

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

  return path.replace(PUBLIC_DIR_NAME, "");
};

export const deleteImage = async (path: string) => {
  const unlinkAsync = promisify(fs.unlink);
  await unlinkAsync(PUBLIC_DIR_NAME + path);
};
