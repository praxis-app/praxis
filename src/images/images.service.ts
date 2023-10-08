import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  deleteImageFile,
  getUploadsPath,
  randomDefaultImagePath,
} from './image.utils';
import { Image } from './models/image.model';
import * as fs from 'fs';

export const enum ImageTypes {
  CoverPhoto = 'coverPhoto',
  ProfilePicture = 'profilePicture',
}

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private repository: Repository<Image>,
  ) {}

  async getImage(where: FindOptionsWhere<Image>, relations?: string[]) {
    return this.repository.findOne({ where, relations });
  }

  async getImages(where?: FindOptionsWhere<Image>) {
    return this.repository.find({ where });
  }

  async createImage(data: Partial<Image>): Promise<Image> {
    return this.repository.save(data);
  }

  async updateImage(id: number, data: Partial<Image>) {
    return this.repository.save({ id, ...data });
  }

  async saveDefaultCoverPhoto(imageData: Partial<Image>) {
    const sourcePath = randomDefaultImagePath();
    const uploadsPath = getUploadsPath();
    const filename = `${Date.now()}.jpeg`;
    const copyPath = `${uploadsPath}/${filename}`;

    fs.copyFile(sourcePath, copyPath, (err) => {
      if (err) {
        throw new Error(`Failed to save default cover photo: ${err}`);
      }
    });
    const image = await this.createImage({
      imageType: ImageTypes.CoverPhoto,
      filename,
      ...imageData,
    });
    return image;
  }

  async deleteImage(where: FindOptionsWhere<Image>) {
    const image = await this.getImage(where);
    if (!image) {
      return;
    }
    await deleteImageFile(image.filename);
    this.repository.delete(where);
    return true;
  }
}
