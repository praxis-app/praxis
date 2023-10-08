import { UnsupportedMediaTypeException } from '@nestjs/common';
import * as fs from 'fs';
import { FileUpload } from 'graphql-upload-ts';
import { promisify } from 'util';

const DEFAULT_IMAGES_SIZE = 10;
const VALID_IMAGE_FORMAT = /(jpe?g|png|gif|webp)$/;

export const getUploadsPath = () => `${__dirname}/../../content`;

export const saveImage = async (image: Promise<FileUpload>) => {
  const { createReadStream, mimetype } = await image;
  const extension = mimetype.split('/')[1];

  if (!extension.match(VALID_IMAGE_FORMAT)) {
    throw new UnsupportedMediaTypeException('Only image files are allowed');
  }

  const uploadsPath = getUploadsPath();
  const filename = `${Date.now()}.${extension}`;
  const path = `${uploadsPath}/${filename}`;

  await new Promise((resolve, reject) => {
    const stream = createReadStream();
    stream
      .pipe(fs.createWriteStream(path))
      .on('error', (error: Error) => {
        fs.unlink(path, () => {
          reject(error);
        });
      })
      .on('finish', resolve);
  });

  return filename;
};

export const copyImage = (filename: string) => {
  const uploadsPath = getUploadsPath();
  const sourcePath = `${uploadsPath}/${filename}`;
  const newFilename = `${Date.now()}.${filename.split('.')[1]}`;
  const newPath = `${uploadsPath}/${newFilename}`;

  fs.copyFile(sourcePath, newPath, (err) => {
    if (err) {
      throw new Error(`Failed to copy image file: ${err}`);
    }
  });
  return newFilename;
};

export const randomDefaultImagePath = () =>
  `${__dirname}/assets/defaults/${
    Math.floor(Math.random() * DEFAULT_IMAGES_SIZE) + 1
  }.jpeg`;

export const deleteImageFile = async (filename: string) => {
  const unlinkAsync = promisify(fs.unlink);
  const uploadsPath = getUploadsPath();
  const imagePath = `${uploadsPath}/${filename}`;
  await unlinkAsync(imagePath);
};
