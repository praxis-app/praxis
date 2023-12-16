import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ServerConfigsService } from '../server-configs/server-configs.service';

@Controller('security.txt')
export class SecurityTxtController {
  constructor(private serverConfigsService: ServerConfigsService) {}

  @Get('/')
  async getSecurityTxt(@Res() res: Response) {
    const { securityTxt } = await this.serverConfigsService.getServerConfig();
    return res.type('text/plain').send(securityTxt || 'No security.txt found');
  }
}
