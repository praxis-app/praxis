import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GroupsService } from '../groups.service';
import { Group } from '../models/group.model';
import {
  GroupMemberRequest,
  GroupMemberRequestStatus,
} from './models/group-member-request.model';

type GroupWithMemberRequestCount = Group & { memberRequestCount: number };

@Injectable()
export class GroupMemberRequestsService {
  constructor(
    @InjectRepository(GroupMemberRequest)
    private groupMemberRequestRepository: Repository<GroupMemberRequest>,

    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
  ) {}

  async getGroupMemberRequest(
    where: FindOptionsWhere<GroupMemberRequest>,
    relations?: string[],
  ) {
    return this.groupMemberRequestRepository.findOne({
      relations,
      where,
    });
  }

  async getGroupMemberRequests(groupId: number) {
    return this.groupMemberRequestRepository.find({
      where: { status: GroupMemberRequestStatus.Pending, groupId },
      order: { createdAt: 'DESC' },
    });
  }

  async getGroupMemberRequestCountBatch(groupIds: number[]) {
    const groups = (await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.memberRequests', 'memberRequest')
      .loadRelationCountAndMap(
        'group.memberRequestCount',
        'group.memberRequests',
        'memberRequest',
        (qb) =>
          qb.andWhere('memberRequest.status = :status', {
            status: GroupMemberRequestStatus.Pending,
          }),
      )
      .select(['group.id'])
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

  async createGroupMemberRequest(groupId: number, userId: number) {
    const groupMemberRequest = await this.groupMemberRequestRepository.save({
      groupId,
      userId,
    });
    return { groupMemberRequest };
  }

  async approveGroupMemberRequest(id: number) {
    const memberRequest = await this.updateGroupMemberRequest(id, {
      status: GroupMemberRequestStatus.Approved,
    });
    const groupMember = await this.groupsService.createGroupMember(
      memberRequest.groupId,
      memberRequest.userId,
    );
    return { groupMember };
  }

  async denyGroupMemberRequest(id: number) {
    await this.updateGroupMemberRequest(id, {
      status: GroupMemberRequestStatus.Denied,
    });
    return true;
  }

  async updateGroupMemberRequest(
    id: number,
    requestData: Partial<GroupMemberRequest>,
  ) {
    await this.groupMemberRequestRepository.update(id, requestData);
    return this.groupMemberRequestRepository.findOneOrFail({ where: { id } });
  }

  async cancelGroupMemberRequest(id: number) {
    await this.deleteGroupMemberRequest({ id });
    return true;
  }

  async deleteGroupMemberRequest(where: FindOptionsWhere<GroupMemberRequest>) {
    await this.groupMemberRequestRepository.delete(where);
    return true;
  }
}
