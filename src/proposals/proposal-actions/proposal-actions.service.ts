import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  EventAttendee,
  EventAttendeeStatus,
} from '../../events/models/event-attendee.model';
import { Event } from '../../events/models/event.model';
import { GroupRolesService } from '../../groups/group-roles/group-roles.service';
import { GroupsService } from '../../groups/groups.service';
import { ImageTypes } from '../../images/image.constants';
import {
  copyImage,
  deleteImageFile,
  saveDefaultImage,
  saveImage,
} from '../../images/image.utils';
import { Image } from '../../images/models/image.model';
import { ServerRolesService } from '../../server-roles/server-roles.service';
import { ProposalActionEventHost } from './models/proposal-action-event-host.model';
import { ProposalActionEventInput } from './models/proposal-action-event.input';
import { ProposalActionEvent } from './models/proposal-action-event.model';
import { ProposalActionGroupConfigInput } from './models/proposal-action-group-config.input';
import { ProposalActionGroupConfig } from './models/proposal-action-group-config.model';
import { ProposalActionPermission } from './models/proposal-action-permission.model';
import { ProposalActionRoleInput } from './models/proposal-action-role-input';
import { ProposalActionRoleMember } from './models/proposal-action-role-member.model';
import { ProposalActionRole } from './models/proposal-action-role.model';
import { ProposalAction } from './models/proposal-action.model';

export enum RoleMemberChangeType {
  Add = 'add',
  Remove = 'remove',
}

@Injectable()
export class ProposalActionsService {
  constructor(
    @InjectRepository(ProposalAction)
    private proposalActionRepository: Repository<ProposalAction>,

    @InjectRepository(ProposalActionGroupConfig)
    private proposalActionGroupConfigRepository: Repository<ProposalActionGroupConfig>,

    @InjectRepository(ProposalActionRole)
    private proposalActionRoleRepository: Repository<ProposalActionRole>,

    @InjectRepository(ProposalActionPermission)
    private proposalActionPermissionRepository: Repository<ProposalActionPermission>,

    @InjectRepository(ProposalActionRoleMember)
    private proposalActionRoleMemberRepository: Repository<ProposalActionRoleMember>,

    @InjectRepository(ProposalActionEvent)
    private proposalActionEventRepository: Repository<ProposalActionEvent>,

    @InjectRepository(ProposalActionEventHost)
    private proposalActionEventHostRepository: Repository<ProposalActionEventHost>,

    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    private groupRolesService: GroupRolesService,
    private serverRolesService: ServerRolesService,
    private groupsService: GroupsService,
  ) {}

  async getProposalAction(
    where: FindOptionsWhere<ProposalAction>,
    relations?: string[],
  ) {
    return this.proposalActionRepository.findOne({ where, relations });
  }

  async getProposalActions(where?: FindOptionsWhere<ProposalAction>) {
    return this.proposalActionRepository.find({ where });
  }

  async getProposedGroupCoverPhoto(proposalActionId: number) {
    const action = await this.getProposalAction({ id: proposalActionId }, [
      'images',
    ]);
    const groupCoverPhoto = action?.images.find(
      (image) => image.imageType === ImageTypes.CoverPhoto,
    );
    return groupCoverPhoto;
  }

  async implementChangeServerRole(proposalActionId: number) {
    const actionRole = await this.getProposalActionRole({ proposalActionId }, [
      'permission',
      'members',
    ]);
    if (!actionRole?.serverRoleId) {
      throw new UserInputError('Could not find proposal action role');
    }
    const roleToUpdate = await this.serverRolesService.getServerRole({
      id: actionRole.serverRoleId,
    });

    const userIdsToAdd = actionRole.members
      ?.filter(({ changeType }) => changeType === RoleMemberChangeType.Add)
      .map(({ userId }) => userId);

    const userIdsToRemove = actionRole.members
      ?.filter(({ changeType }) => changeType === RoleMemberChangeType.Remove)
      .map(({ userId }) => userId);

    await this.serverRolesService.updateServerRole({
      id: roleToUpdate.id,
      name: actionRole.name,
      color: actionRole.color,
      selectedUserIds: userIdsToAdd,
      permissions: actionRole.permission,
    });
    if (userIdsToRemove?.length) {
      await this.serverRolesService.deleteServerRoleMembers(
        roleToUpdate.id,
        userIdsToRemove,
      );
    }
    if (actionRole.name || actionRole.color) {
      await this.updateProposalActionRole(actionRole.id, {
        oldName: actionRole.name ? roleToUpdate.name : undefined,
        oldColor: actionRole.color ? roleToUpdate.color : undefined,
      });
    }
  }

  // TODO: Reduce duplication between this and group role method
  async implementCreateServerRole(proposalActionId: number) {
    const role = await this.getProposalActionRole({ proposalActionId }, [
      'permission',
      'members',
    ]);
    if (!role) {
      throw new UserInputError('Could not find proposal action role');
    }
    const { name, color, permission } = role;
    const members = role.members?.map(({ userId }) => ({ id: userId }));
    await this.serverRolesService.createServerRole(
      {
        name,
        color,
        permission,
        members,
      },
      true,
    );
  }

  async implementGroupEvent(proposalActionId: number, groupId: number) {
    const event = await this.getProposalActionEvent({ proposalActionId }, [
      'hosts',
      'images',
    ]);
    if (!event) {
      throw new UserInputError('Could not find proposal action event');
    }
    const host = event.hosts?.find(
      ({ status }) => status === EventAttendeeStatus.Host,
    );
    if (!host) {
      throw new UserInputError('Could not find proposal action event host');
    }
    await this.createEventFromProposalAction(event, groupId, host.userId);
  }

  async implementCreateGroupRole(proposalActionId: number, groupId: number) {
    const role = await this.getProposalActionRole({ proposalActionId }, [
      'permission',
      'members',
    ]);
    if (!role) {
      throw new UserInputError('Could not find proposal action role');
    }
    const { name, color, permission } = role;
    const members = role.members?.map(({ userId }) => ({ id: userId }));
    await this.groupRolesService.createGroupRole(
      {
        name,
        color,
        permission,
        groupId,
        members,
      },
      true,
    );
  }

  async implementChangeGroupRole(proposalActionId: number) {
    const actionRole = await this.getProposalActionRole({ proposalActionId }, [
      'permission',
      'members',
    ]);
    if (!actionRole?.groupRoleId) {
      throw new UserInputError('Could not find proposal action role');
    }
    const roleToUpdate = await this.groupRolesService.getGroupRole({
      id: actionRole.groupRoleId,
    });

    const userIdsToAdd = actionRole.members
      ?.filter(({ changeType }) => changeType === RoleMemberChangeType.Add)
      .map(({ userId }) => userId);

    const userIdsToRemove = actionRole.members
      ?.filter(({ changeType }) => changeType === RoleMemberChangeType.Remove)
      .map(({ userId }) => userId);

    await this.groupRolesService.updateGroupRole({
      id: roleToUpdate.id,
      name: actionRole.name,
      color: actionRole.color,
      selectedUserIds: userIdsToAdd,
      permissions: actionRole.permission,
    });
    if (userIdsToRemove?.length) {
      await this.groupRolesService.deleteGroupRoleMembers(
        roleToUpdate.id,
        userIdsToRemove,
      );
    }
    if (actionRole.name || actionRole.color) {
      await this.updateProposalActionRole(actionRole.id, {
        oldName: actionRole.name ? roleToUpdate.name : undefined,
        oldColor: actionRole.color ? roleToUpdate.color : undefined,
      });
    }
  }

  async implementChangeGroupCoverPhoto(
    proposalActionId: number,
    groupId: number,
  ) {
    const currentCoverPhoto = await this.imageRepository.findOneOrFail({
      where: { groupId, imageType: ImageTypes.CoverPhoto },
    });
    const newCoverPhoto =
      await this.getProposedGroupCoverPhoto(proposalActionId);

    if (!newCoverPhoto) {
      throw new UserInputError('Could not find group cover photo');
    }

    const imageFilename = copyImage(newCoverPhoto.filename);
    await this.imageRepository.save({
      groupId,
      filename: imageFilename,
      imageType: newCoverPhoto.imageType,
    });

    await this.imageRepository.delete({ id: currentCoverPhoto.id });
    await deleteImageFile(currentCoverPhoto.filename);
  }

  async implementChangeGroupConfig(proposalActionId: number, groupId: number) {
    const proposedGroupConfig = await this.getProposalActionGroupConfig({
      proposalActionId,
    });
    if (!proposedGroupConfig) {
      throw new UserInputError('Could not find proposed group settings');
    }

    const {
      adminModel,
      decisionMakingModel,
      ratificationThreshold,
      reservationsLimit,
      standAsidesLimit,
      votingTimeLimit,
      privacy,
    } = proposedGroupConfig;

    const groupConfig = await this.groupsService.getGroupConfig({
      groupId,
    });

    // Record old group config
    await this.updateProposalActionGroupConfig(proposedGroupConfig.id, {
      oldPrivacy: privacy ? groupConfig.privacy : undefined,

      oldAdminModel: adminModel ? groupConfig.adminModel : undefined,

      oldDecisionMakingModel: decisionMakingModel
        ? groupConfig.decisionMakingModel
        : undefined,

      oldVotingTimeLimit: votingTimeLimit
        ? groupConfig.votingTimeLimit
        : undefined,

      oldRatificationThreshold:
        ratificationThreshold || ratificationThreshold === 0
          ? groupConfig.ratificationThreshold
          : undefined,

      oldReservationsLimit:
        reservationsLimit || reservationsLimit === 0
          ? groupConfig.reservationsLimit
          : undefined,

      oldStandAsidesLimit:
        standAsidesLimit || standAsidesLimit === 0
          ? groupConfig.standAsidesLimit
          : undefined,
    });

    // Implement proposal - update group config
    await this.groupsService.updateGroupConfig({
      adminModel: adminModel ?? undefined,
      decisionMakingModel: decisionMakingModel ?? undefined,
      ratificationThreshold: ratificationThreshold ?? undefined,
      reservationsLimit: reservationsLimit ?? undefined,
      standAsidesLimit: standAsidesLimit ?? undefined,
      votingTimeLimit: votingTimeLimit ?? undefined,
      privacy: privacy ?? undefined,
      groupId,
    });
  }

  async saveProposalActionImage(
    proposalActionId: number,
    image: Promise<FileUpload>,
    imageType: string,
  ) {
    const filename = await saveImage(image);
    await this.imageRepository.save({
      filename,
      imageType,
      proposalActionId,
    });
  }

  async deleteProposalActionImage(proposalActionId: number) {
    const image = await this.imageRepository.findOne({
      where: { proposalActionId },
    });
    if (!image) {
      return;
    }
    await deleteImageFile(image.filename);
    this.imageRepository.delete({ proposalActionId });
    return true;
  }

  async getProposalActionEvent(
    where: FindOptionsWhere<ProposalActionEvent>,
    relations?: string[],
  ) {
    return this.proposalActionEventRepository.findOne({
      where,
      relations,
    });
  }

  async getProposalActionEventHost(proposalActionEventId: number) {
    const host = await this.proposalActionEventHostRepository.findOne({
      where: { proposalActionEventId, status: EventAttendeeStatus.Host },
      relations: ['user'],
    });
    if (!host) {
      throw new Error('Could not find host for proposal action event');
    }
    return host.user;
  }

  async getProposalActionEventCoverPhoto(proposalActionEventId: number) {
    return this.imageRepository.findOne({
      where: { proposalActionEventId, imageType: ImageTypes.CoverPhoto },
    });
  }

  async createProposalActionEvent(
    proposalActionId: number,
    {
      hostId,
      coverPhoto,
      ...proposalActionEventData
    }: Partial<ProposalActionEventInput>,
  ) {
    const proposalActionEvent = await this.proposalActionEventRepository.save({
      ...proposalActionEventData,
      proposalActionId,
    });
    await this.proposalActionEventHostRepository.save({
      proposalActionEventId: proposalActionEvent.id,
      status: EventAttendeeStatus.Host,
      userId: hostId,
    });
    if (coverPhoto) {
      await this.saveProposalActionEventCoverPhoto(
        proposalActionEvent.id,
        coverPhoto,
      );
    } else {
      await this.saveProposalActionEventDefaultCoverPhoto(
        proposalActionEvent.id,
      );
    }
  }

  async createEventFromProposalAction(
    { images, ...eventData }: ProposalActionEvent,
    groupId: number,
    hostId: number,
  ) {
    const event = await this.eventRepository.save({ ...eventData, groupId });
    try {
      await this.eventAttendeeRepository.save({
        status: EventAttendeeStatus.Host,
        eventId: event.id,
        userId: hostId,
      });
      const coverPhoto = images.find(
        ({ imageType }) => imageType === ImageTypes.CoverPhoto,
      );
      if (!coverPhoto) {
        throw new Error();
      }
      const imageFilename = copyImage(coverPhoto.filename);
      await this.imageRepository.save({
        eventId: event.id,
        filename: imageFilename,
        imageType: coverPhoto.imageType,
      });
    } catch {
      await this.eventRepository.delete(event.id);
      throw new Error('Failed to create event from proposal action');
    }
  }

  async saveProposalActionEventCoverPhoto(
    proposalActionEventId: number,
    coverPhoto: Promise<FileUpload>,
  ) {
    const filename = await saveImage(coverPhoto);
    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
      filename,
    });
  }

  async saveProposalActionEventDefaultCoverPhoto(
    proposalActionEventId: number,
  ) {
    const filename = await saveDefaultImage();
    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
      filename,
    });
  }

  async getProposalActionGroupConfig(
    where: FindOptionsWhere<ProposalActionGroupConfig>,
    relations?: string[],
  ) {
    return this.proposalActionGroupConfigRepository.findOne({
      where,
      relations,
    });
  }

  async createProposalActionGroupConfig(
    proposalActionId: number,
    proposalActionGroupConfigData: ProposalActionGroupConfigInput,
  ) {
    await this.proposalActionGroupConfigRepository.save({
      ...proposalActionGroupConfigData,
      proposalActionId,
    });
  }

  async updateProposalActionGroupConfig(
    id: number,
    data: Partial<ProposalActionGroupConfig>,
  ) {
    await this.proposalActionGroupConfigRepository.update(id, data);
  }

  async getProposalActionRole(
    where: FindOptionsWhere<ProposalActionRole>,
    relations?: string[],
  ) {
    return this.proposalActionRoleRepository.findOne({
      where,
      relations,
    });
  }

  async getProposalActionPermission(proposalActionRoleId: number) {
    return this.proposalActionPermissionRepository.findOne({
      where: { proposalActionRoleId },
    });
  }

  async getProposalActionRoleMembers(proposalActionRoleId: number) {
    return this.proposalActionRoleMemberRepository.find({
      where: { proposalActionRoleId },
    });
  }

  async createProposalActionRole(
    proposalActionId: number,
    { roleToUpdateId, ...role }: ProposalActionRoleInput,
    isServerScope: boolean,
  ) {
    await this.proposalActionRoleRepository.save({
      ...role,
      permission: role.permissions,
      groupRoleId: isServerScope ? undefined : roleToUpdateId,
      serverRoleId: isServerScope ? roleToUpdateId : undefined,
      proposalActionId,
    });
  }

  async updateProposalActionRole(
    id: number,
    data: Partial<ProposalActionRole>,
  ) {
    await this.proposalActionRoleRepository.update(id, data);
  }
}
