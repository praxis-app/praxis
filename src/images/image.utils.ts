import { Logger, UnsupportedMediaTypeException } from '@nestjs/common';
import * as fs from 'fs';
import { FileUpload } from 'graphql-upload-ts';
import { promisify } from 'util';
import { DEFAULT_IMAGES_SIZE, VALID_IMAGE_FORMAT } from './image.constants';

export const getUploadsPath = () => `${__dirname}/../../content`;

export const saveImage = async (
  uploadedImage: Promise<FileUpload>,
  logger?: Logger,
) => {
  const image = await uploadedImage;
  const extension = image.mimetype.split('/')[1];

  if (!extension.match(VALID_IMAGE_FORMAT)) {
    throw new UnsupportedMediaTypeException('Only image files are allowed');
  }

  if (logger) {
    logger.log(`Saving image: ${JSON.stringify(image)}`);
  }

  const uploadsPath = getUploadsPath();
  const filename = `${Date.now()}.${extension}`;
  const path = `${uploadsPath}/${filename}`;

  await new Promise((resolve, reject) => {
    const stream = image.createReadStream();
    stream
      .pipe(fs.createWriteStream(path))
      .on('error', (error: Error) => {
        if (logger) {
          logger.error(`Failed to save image: ${JSON.stringify(error)}`);
        }
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

export const saveDefaultImage = async () => {
  const sourcePath = randomDefaultImagePath();
  const uploadsPath = getUploadsPath();
  const filename = `${Date.now()}.jpeg`;
  const copyPath = `${uploadsPath}/${filename}`;

  fs.copyFile(sourcePath, copyPath, (err) => {
    if (err) {
      throw new Error(`Failed to save default profile picture: ${err}`);
    }
  });
  return filename;
};

export const deleteImageFile = async (filename: string) => {
  const unlinkAsync = promisify(fs.unlink);
  const uploadsPath = getUploadsPath();
  const imagePath = `${uploadsPath}/${filename}`;
  await unlinkAsync(imagePath);
};
