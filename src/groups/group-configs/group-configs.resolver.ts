import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Dataloaders } from "../../dataloader/dataloader.types";
import { Group } from "../models/group.model";
import { UpdateGroupPayload } from "../models/update-group.payload";
import { GroupConfigsService } from "./group-configs.service";
import { GroupConfig } from "./models/group-config.model";
import { UpdateGroupConfigInput } from "./models/update-group-config.input";

@Resolver(() => GroupConfig)
export class GroupConfigsResolver {
  constructor(private groupConfigsService: GroupConfigsService) {}

  // TODO: Remove when no longer needed for testing
  @Query(() => GroupConfig)
  async groupConfig(@Args("id", { type: () => Int }) id: number) {
    return this.groupConfigsService.getGroupConfig({ id });
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: GroupConfig
  ) {
    return loaders.groupsLoader.load(groupId);
  }

  @Mutation(() => UpdateGroupPayload)
  async updateGroupConfig(
    @Args("groupConfigData") groupConfigData: UpdateGroupConfigInput
  ) {
    return this.groupConfigsService.updateGroupConfig(groupConfigData);
  }
}
