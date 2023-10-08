import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { getUploadsPath } from './image.utils';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private service: ImagesService) {}

  @Get(':id/view')
  async getImageFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const image = await this.service.getImage({ id });
    if (!image) {
      throw new Error('Image not found');
    }
    const root = getUploadsPath();
    return res.sendFile(image.filename, { root });
  }
}
