import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { GroupMembersService } from "../group-members/group-members.service";
import { Group } from "../models/group.model";
import {
  MemberRequest,
  MemberRequestStatus,
} from "./models/member-request.model";

type GroupWithMemberRequestCount = Group & { memberRequestCount: number };

@Injectable()
export class MemberRequestsService {
  constructor(
    @InjectRepository(MemberRequest)
    private repository: Repository<MemberRequest>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private groupMembersService: GroupMembersService
  ) {}

  async getMemberRequest(where?: FindOptionsWhere<MemberRequest>) {
    return this.repository.findOne({ where });
  }

  async getMemberRequests(groupName: string) {
    return this.repository.find({
      where: {
        group: { name: groupName },
        status: MemberRequestStatus.Pending,
      },
      order: { createdAt: "DESC" },
    });
  }

  async getMemberRequestCountByBatch(groupIds: number[]) {
    const groups = (await this.groupRepository
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.memberRequests", "memberRequest")
      .loadRelationCountAndMap(
        "group.memberRequestCount",
        "group.memberRequests",
        "memberRequest",
        (qb) =>
          qb.andWhere("memberRequest.status = :status", {
            status: MemberRequestStatus.Pending,
          })
      )
      .select(["group.id"])
      .whereInIds(groupIds)
      .getMany()) as GroupWithMemberRequestCount[];

    return groupIds.map((id) => {
      const group = groups.find((group: Group) => group.id === id);
      if (!group) {
        return new Error(`Could not load member request count: ${id}`);
      }
      return group.memberRequestCount;
    });
  }

  async createMemberRequest(groupId: number, userId: number) {
    const memberRequest = await this.repository.save({ groupId, userId });
    return { memberRequest };
  }

  async approveMemberRequest(id: number) {
    const memberRequest = await this.updateMemberRequest(id, {
      status: MemberRequestStatus.Approved,
    });
    const groupMember = await this.groupMembersService.createGroupMember(
      memberRequest.groupId,
      memberRequest.userId
    );
    return { groupMember };
  }

  async denyMemberRequest(id: number) {
    await this.updateMemberRequest(id, {
      status: MemberRequestStatus.Denied,
    });
    return true;
  }

  async updateMemberRequest(
    id: number,
    memberRequestData: Partial<MemberRequest>
  ) {
    await this.repository.update(id, memberRequestData);
    return this.repository.findOneOrFail({ where: { id } });
  }

  async cancelMemberRequest(id: number) {
    await this.deleteMemberRequest({ id });
    return true;
  }

  async deleteMemberRequest(where: FindOptionsWhere<MemberRequest>) {
    await this.repository.delete(where);
    return true;
  }
}
