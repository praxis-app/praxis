import { Field, ObjectType } from '@nestjs/graphql';
import { ServerConfig } from './server-configs.model';
import { Canary } from '../../canaries/models/canary.model';

@ObjectType()
export class UpdateServerConfigPayload {
  @Field()
  serverConfig: ServerConfig;

  @Field()
  canary: Canary;
}
