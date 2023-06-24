import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Permission } from "./models/permission.model";
import { ServerPermission } from "./models/server-permission.model";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,

    @InjectRepository(ServerPermission)
    private serverPermissionRepository: Repository<ServerPermission>
  ) {}

  async getPermission(id: number) {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async getPermissions(where?: FindOptionsWhere<Permission>) {
    return this.permissionRepository.find({ where, order: { id: "DESC" } });
  }

  async getServerPermission(id: number) {
    return this.serverPermissionRepository.findOne({ where: { id } });
  }

  async getServerPermissions(where?: FindOptionsWhere<Permission>) {
    return this.serverPermissionRepository.find({
      where,
      order: { id: "DESC" },
    });
  }
}
