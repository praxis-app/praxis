import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { Group } from '../models/group.model';
import { UpdateGroupPayload } from '../models/update-group.payload';
import { GroupConfigsService } from './group-configs.service';
import { GroupConfig } from './models/group-config.model';
import { UpdateGroupConfigInput } from './models/update-group-config.input';

@Resolver(() => GroupConfig)
export class GroupConfigsResolver {
  constructor(private groupConfigsService: GroupConfigsService) {}

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: GroupConfig,
  ) {
    return loaders.groupsLoader.load(groupId);
  }

  @ResolveField(() => Boolean)
  async isPublic(@Parent() { id }: GroupConfig) {
    return this.groupConfigsService.getIsPublic(id);
  }

  @Mutation(() => UpdateGroupPayload)
  async updateGroupConfig(
    @Args('groupConfigData') groupConfigData: UpdateGroupConfigInput,
  ) {
    return this.groupConfigsService.updateGroupConfig(groupConfigData);
  }
}
