import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ServerConfig } from './models/server-config.model';
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

  @Mutation(() => UpdateServerConfigPayload)
  async updateServerConfig(
    @Args('serverConfigData') serverConfigData: UpdateServerConfigInput,
  ) {
    return this.serverConfigsService.updateServerConfig(serverConfigData);
  }
}
