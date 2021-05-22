import fs, { createWriteStream } from "fs";
import { promisify } from "util";

export const saveImage = async (image: any): Promise<string> => {
  const { createReadStream, mimetype } = await image;
  const extension = mimetype.split("/")[1];
  const path = "public/uploads/" + Date.now() + "." + extension;

  await new Promise((resolve, reject) => {
    const stream = createReadStream();

    stream
      .on("error", (error: any) => {
        fs.unlink(path, () => {
          reject(error);
        });
      })
      .pipe(createWriteStream(path))
      .on("error", reject)
      .on("finish", resolve);
  });

  return path.replace("public", "");
};

export const deleteImage = async (path: string) => {
  const unlinkAsync = promisify(fs.unlink);
  await unlinkAsync("public" + path);
};
