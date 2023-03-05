import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { deleteImageFile } from "./image.utils";
import { Image } from "./models/image.model";

export const enum ImageTypes {
  CoverPhoto = "coverPhoto",
  ProfilePicture = "profilePicture",
}

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private repository: Repository<Image>
  ) {}

  async getImage(where: FindOptionsWhere<Image>) {
    return this.repository.findOne({ where });
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
