import { Controller, Get, Param, ParseIntPipe, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ImagesService } from "./images.service";

@ApiTags("images")
@Controller("images")
export class ImagesController {
  constructor(private service: ImagesService) {}

  @Get(":id/view")
  async getImageFile(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const image = await this.service.getImage({ id });
    if (!image) {
      throw new Error("Image not found");
    }
    return res.sendFile(image.filename, { root: "./uploads" });
  }
}
