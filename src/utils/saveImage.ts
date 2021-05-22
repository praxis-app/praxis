import { createWriteStream } from "fs";

const unlink = (_path: any, _a1: () => void) => {};

const saveImage = async (image: any): Promise<string> => {
  const { createReadStream, mimetype } = await image;
  const extension = mimetype.split("/")[1];
  const path = "public/uploads/" + Date.now() + "." + extension;

  await new Promise((resolve, reject) => {
    const stream = createReadStream();

    stream
      .on("error", (error: any) => {
        unlink(path, () => {
          reject(error);
        });
      })
      .pipe(createWriteStream(path))
      .on("error", reject)
      .on("finish", resolve);
  });

  return path.replace("public", "");
};

export default saveImage;
