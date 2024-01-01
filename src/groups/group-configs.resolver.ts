import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Dataloaders } from '../dataloader/dataloader.types';
import { GroupsService } from './groups.service';
import { GroupConfig } from './models/group-config.model';
import { Group } from './models/group.model';
import { UpdateGroupConfigInput } from './models/update-group-config.input';
import { UpdateGroupPayload } from './models/update-group.payload';

@Resolver(() => GroupConfig)
export class GroupConfigsResolver {
  constructor(private groupsService: GroupsService) {}

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: GroupConfig,
  ) {
    return loaders.groupsLoader.load(groupId);
  }

  @ResolveField(() => Boolean)
  async isPublic(@Parent() { id }: GroupConfig) {
    return this.groupsService.getIsPublic(id);
  }

  @Mutation(() => UpdateGroupPayload)
  async updateGroupConfig(
    @Args('groupConfigData') groupConfigData: UpdateGroupConfigInput,
  ) {
    return this.groupsService.updateGroupConfig(groupConfigData);
  }
}
