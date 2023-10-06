import { UserInputError, ValidationError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as cryptoRandomString from 'crypto-random-string';
import { Repository } from 'typeorm';
import { DEFAULT_PAGE_SIZE } from '../shared/shared.constants';
import { User } from '../users/models/user.model';
import { CreateServerInviteInput } from './models/create-server-invite.input';
import { ServerInvite } from './models/server-invite.model';
import { validateServerInvite } from './server-invites.utils';

@Injectable()
export class ServerInvitesService {
  constructor(
    @InjectRepository(ServerInvite)
    private repository: Repository<ServerInvite>,
  ) {}

  async getValidServerInvite(token: string) {
    const serverInvite = await this.repository.findOne({
      where: { token },
    });
    if (!serverInvite) {
      throw new UserInputError('Invite not found');
    }
    const isValid = validateServerInvite(serverInvite);
    if (!isValid) {
      throw new ValidationError('Invalid server invite');
    }
    return serverInvite;
  }

  async getValidServerInvites() {
    const serverInvites = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    const validServerInvites = serverInvites.filter((serverInvite) =>
      validateServerInvite(serverInvite),
    );

    // TODO: Update once pagination has been implemented
    return validServerInvites.slice(0, DEFAULT_PAGE_SIZE);
  }

  async createServerInvite(
    serverInviteData: CreateServerInviteInput,
    user: User,
  ) {
    const token = cryptoRandomString({ length: 8 });
    const serverInvite = await this.repository.save({
      ...serverInviteData,
      userId: user.id,
      token,
    });
    return { serverInvite };
  }

  async redeemServerInvite(token: string) {
    await this.repository.increment({ token }, 'uses', 1);
  }

  async deleteServerInvite(id: number) {
    await this.repository.delete(id);
    return true;
  }
}
