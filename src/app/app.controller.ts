import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('/')
export class AppController {
  @Get('security.txt')
  async getSecurityTxt(@Res() res: Response) {
    return res.send({ message: 'security.txt' });
  }
}
