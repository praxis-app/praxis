import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ServerConfig } from './models/server-config.model';
import { UpdateDefaultGroupsInput } from './models/update-default-groups.input';
import { UpdateDefaultGroupsPayload } from './models/update-default-groups.payload';
import { UpdateServerConfigInput } from './models/update-server-config.input';
import { UpdateServerConfigPayload } from './models/update-server-config.payload';
import { ServerConfigsService } from './server-configs.service';

@Resolver(() => ServerConfig)
export class ServerConfigsResolver {
  constructor(private serverConfigsService: ServerConfigsService) {}

  @Query(() => ServerConfig)
  async serverConfig() {
    return this.serverConfigsService.getServerConfig();
  }

  @ResolveField(() => String)
  async websiteURL() {
    return this.serverConfigsService.getWebsiteURL();
  }

  @ResolveField(() => String)
  async contactEmail() {
    return this.serverConfigsService.getContactEmail();
  }

  @Mutation(() => UpdateServerConfigPayload)
  async updateServerConfig(
    @Args('serverConfigData') serverConfigData: UpdateServerConfigInput,
  ) {
    return this.serverConfigsService.updateServerConfig(serverConfigData);
  }

  @Mutation(() => UpdateDefaultGroupsPayload)
  async updateDefaultGroups(
    @Args('defaultGroupsData') defaultGroupsData: UpdateDefaultGroupsInput,
  ) {
    return this.serverConfigsService.updateDefaultGroups(defaultGroupsData);
  }
}
