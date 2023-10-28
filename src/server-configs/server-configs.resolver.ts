import { Resolver } from '@nestjs/graphql';
import { ServerConfig } from './models/server-configs.model';

@Resolver(() => ServerConfig)
export class ServerConfigsResolver {}
