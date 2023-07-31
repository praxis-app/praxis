import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLUpload } from "graphql-upload";
import { AuthModule } from "./auth/auth.module";
import { RefreshTokensModule } from "./auth/refresh-tokens/refresh-tokens.module";
import { ShieldModule } from "./auth/shield/shield.module";
import { shieldPermissions } from "./auth/shield/shield.permissions";
import { Environment } from "./common/common.constants";
import { ContextModule } from "./context/context.module";
import { ContextService } from "./context/context.service";
import { DatabaseModule } from "./database/database.module";
import { DataloaderModule } from "./dataloader/dataloader.module";
import { EventsModule } from "./events/events.module";
import { GroupMemberRequestsModule } from "./groups/group-member-requests/group-member-requests.module";
import { GroupRolesModule } from "./groups/group-roles/group-roles.module";
import { GroupsModule } from "./groups/groups.module";
import { ImagesModule } from "./images/images.module";
import { LikesModule } from "./likes/likes.module";
import { PostsModule } from "./posts/posts.module";
import { ProposalsModule } from "./proposals/proposals.module";
import { ServerInvitesModule } from "./server-invites/server-invites.module";
import { ServerRolesModule } from "./server-roles/server-roles.module";
import { UsersModule } from "./users/users.module";
import { VotesModule } from "./votes/votes.module";

export const ApolloModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [ContextModule],
  inject: [ContextService, ConfigService],
  useFactory(contextService: ContextService, configService: ConfigService) {
    return {
      context: contextService.getContext,
      transformSchema: (schema: GraphQLSchema) => {
        schema = applyMiddleware(schema, shieldPermissions);
        return schema;
      },
      autoSchemaFile: true,
      cors: { origin: true, credentials: true },
      csrfPrevention: configService.get("NODE_ENV") !== Environment.Development,
      resolvers: { Upload: GraphQLUpload },
    };
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApolloModule,
    AuthModule,
    DatabaseModule,
    DataloaderModule,
    EventsModule,
    GroupMemberRequestsModule,
    GroupRolesModule,
    GroupsModule,
    ImagesModule,
    LikesModule,
    PostsModule,
    ProposalsModule,
    RefreshTokensModule,
    ServerInvitesModule,
    ServerRolesModule,
    ShieldModule,
    UsersModule,
    VotesModule,
  ],
})
export class AppModule {}
