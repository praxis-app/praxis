import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError, ValidationError } from "apollo-server-express";
import * as cryptoRandomString from "crypto-random-string";
import { Repository } from "typeorm";
import { User } from "../users/models/user.model";
import { CreateServerInviteInput } from "./models/create-server-invite.input";
import { ServerInvite } from "./models/server-invite.model";
import { validateServerInvite } from "./server-invites.utils";

@Injectable()
export class ServerInvitesService {
  constructor(
    @InjectRepository(ServerInvite)
    private repository: Repository<ServerInvite>
  ) {}

  async getServerInvite(token: string) {
    const serverInvite = await this.repository.findOne({
      where: { token },
    });
    if (!serverInvite) {
      throw new UserInputError("Invite not found");
    }
    const isValid = validateServerInvite(serverInvite);
    if (!isValid) {
      throw new ValidationError("Invalid server invite");
    }
    return serverInvite;
  }

  async getServerInvites() {
    const serverInvites = await this.repository.find({
      order: { createdAt: "DESC" },
    });
    return serverInvites.filter((serverInvite) =>
      validateServerInvite(serverInvite)
    );
  }

  async createServerInvite(
    serverInviteData: CreateServerInviteInput,
    user: User
  ) {
    const token = cryptoRandomString({ length: 8 });
    const serverInvite = await this.repository.save({
      ...serverInviteData,
      userId: user.id,
      token,
    });
    return { serverInvite };
  }

  async redeemServerInvite(id: number) {
    await this.repository.increment({ id }, "uses", 1);
  }

  async deleteServerInvite(id: number) {
    await this.repository.delete(id);
    return true;
  }
}
