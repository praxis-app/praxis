import { Injectable } from '@nestjs/common';
import { ServerConfigsService } from '../server-configs/server-configs.service';

@Injectable()
export class SecurityTxtService {
  constructor(private serverConfigsService: ServerConfigsService) {}

  async getSecurityTxt() {
    const { securityTxt } = await this.serverConfigsService.getServerConfig();
    return securityTxt || 'No security.txt found';
  }
}
