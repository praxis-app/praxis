import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { ImageTypes } from './image.constants';
import {
  deleteImageFile,
  getUploadsPath,
  randomDefaultImagePath,
} from './image.utils';
import { Image } from './models/image.model';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private repository: Repository<Image>,

    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
  ) {}

  // @Inject(forwardRef(() => ProposalsService))
  // private proposalsService: ProposalsService,

  async getImage(where: FindOptionsWhere<Image>, relations?: string[]) {
    return this.repository.findOne({ where, relations });
  }

  async getImages(where?: FindOptionsWhere<Image>) {
    return this.repository.find({ where });
  }

  async isPublicImage(id: number) {
    const image = await this.getImage({ id });
    if (!image) {
      throw new Error(`Image not found: ${id}`);
    }
    if (image.postId) {
      const isPublicPostImage = await this.postsService.isPublicPostImage(id);
      if (isPublicPostImage) {
        return true;
      }
    }
    // if (image.proposalId) {
    //   const isPublicProposalImage =
    //     await this.proposalsService.isPublicProposalImage(image);
    //   if (isPublicProposalImage) {
    //     return true;
    //   }
    // }
    return false;
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
