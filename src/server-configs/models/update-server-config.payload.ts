import { Field, ObjectType } from '@nestjs/graphql';
import { ServerConfig } from './server-configs.model';

@ObjectType()
export class UpdateServerConfigPayload {
  @Field()
  serverConfig: ServerConfig;
}
