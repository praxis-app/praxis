import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { Group } from "../models/group.model";
import { GroupMember } from "./models/group-member.model";

type GroupWithMemberCount = Group & { memberCount: number };

@Injectable()
export class GroupMembersService {
  constructor(
    @InjectRepository(GroupMember)
    private repository: Repository<GroupMember>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>
  ) {}

  async getGroupMember(where?: FindOptionsWhere<GroupMember>) {
    return this.repository.findOne({ where });
  }

  async getGroupMembers(where?: FindOptionsWhere<GroupMember>) {
    return this.repository.find({ where, order: { createdAt: "DESC" } });
  }

  async getGroupMembersByBatch(groupIds: number[]) {
    const groupMembers = await this.getGroupMembers({
      groupId: In(groupIds),
    });
    const mappedGroupMembers = groupIds.map(
      (id) =>
        groupMembers.filter((member: GroupMember) => member.groupId === id) ||
        new Error(`Could not load group members: ${id}`)
    );
    return mappedGroupMembers;
  }

  async getGroupMemberCountByBatch(groupIds: number[]) {
    const groups = (await this.groupRepository
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.members", "groupMember")
      .loadRelationCountAndMap("group.memberCount", "group.members")
      .select(["group.id"])
      .whereInIds(groupIds)
      .getMany()) as GroupWithMemberCount[];

    return groupIds.map((id) => {
      const group = groups.find((group: Group) => group.id === id);
      if (!group) {
        return new Error(`Could not load group member count: ${id}`);
      }
      return group.memberCount;
    });
  }

  async createGroupMember(
    groupId: number,
    userId: number
  ): Promise<GroupMember> {
    return this.repository.save({ groupId, userId });
  }

  async deleteGroupMember(where: FindOptionsWhere<GroupMember>) {
    await this.repository.delete(where);
    return true;
  }
}
