import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SecurityTxtService } from './security-txt.service';

@Controller('security.txt')
export class SecurityTxtController {
  constructor(private securityTxtService: SecurityTxtService) {}

  @Get('/')
  async getSecurityTxt(@Res() res: Response) {
    const securityTxt = await this.securityTxtService.getSecurityTxt();
    return res.type('text/plain').send(securityTxt);
  }
}
