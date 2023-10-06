import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { EventAttendeeStatus } from '../../events/event-attendees/models/event-attendee.model';
import { GroupRolesService } from '../../groups/group-roles/group-roles.service';
import { saveImage } from '../../images/image.utils';
import { ImageTypes, ImagesService } from '../../images/images.service';
import { ProposalAction } from './models/proposal-action.model';
import { ProposalActionEventsService } from './proposal-action-events/proposal-action-events.service';
import {
  ProposalActionRolesService,
  RoleMemberChangeType,
} from './proposal-action-roles/proposal-action-roles.service';

@Injectable()
export class ProposalActionsService {
  constructor(
    @InjectRepository(ProposalAction)
    private proposalActionRepository: Repository<ProposalAction>,

    private groupRolesService: GroupRolesService,
    private imagesService: ImagesService,
    private proposalActionEventsService: ProposalActionEventsService,
    private proposalActionRolesService: ProposalActionRolesService,
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

  async getProposalActionsBatch(proposalIds: number[]) {
    const proposalActions = await this.getProposalActions({
      proposalId: In(proposalIds),
    });
    return proposalIds.map(
      (id) =>
        proposalActions.find(
          (proposalAction: ProposalAction) => proposalAction.id === id,
        ) || new Error(`Could not load proposal action: ${id}`),
    );
  }

  async implementGroupEvent(proposalActionId: number, groupId: number) {
    const event = await this.proposalActionEventsService.getProposalActionEvent(
      { proposalActionId },
      ['hosts', 'images'],
    );
    if (!event) {
      throw new UserInputError('Could not find proposal action event');
    }
    const host = event.hosts?.find(
      ({ status }) => status === EventAttendeeStatus.Host,
    );
    if (!host) {
      throw new UserInputError('Could not find proposal action event host');
    }
    await this.proposalActionEventsService.createEventFromProposalAction(
      event,
      groupId,
      host.userId,
    );
  }

  async implementCreateGroupRole(proposalActionId: number, groupId: number) {
    const role = await this.proposalActionRolesService.getProposalActionRole(
      { proposalActionId },
      ['permission', 'members'],
    );
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
    const actionRole =
      await this.proposalActionRolesService.getProposalActionRole(
        { proposalActionId },
        ['permission', 'members'],
      );
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
      await this.proposalActionRolesService.updateProposalActionRole(
        actionRole.id,
        {
          oldName: actionRole.name ? roleToUpdate.name : undefined,
          oldColor: actionRole.color ? roleToUpdate.color : undefined,
        },
      );
    }
  }

  // TODO: Ensure new image file is saved in case group is deleted
  async implementChangeGroupCoverPhoto(
    proposalActionId: number,
    groupId: number,
  ) {
    const currentCoverPhoto = await this.imagesService.getImage({
      imageType: ImageTypes.CoverPhoto,
      groupId,
    });
    const newCoverPhoto =
      await this.getProposedGroupCoverPhoto(proposalActionId);
    if (!currentCoverPhoto || !newCoverPhoto) {
      throw new UserInputError('Could not find group cover photo');
    }
    await this.imagesService.updateImage(newCoverPhoto.id, { groupId });
    await this.imagesService.deleteImage({ id: currentCoverPhoto.id });
  }

  async saveProposalActionImage(
    proposalActionId: number,
    image: Promise<FileUpload>,
    imageType: string,
  ) {
    const filename = await saveImage(image);
    await this.imagesService.createImage({
      filename,
      imageType,
      proposalActionId,
    });
  }
}
