import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLUpload } from "graphql-upload";
import { getClaims, getSub } from "../auth/auth.utils";
import { RefreshTokensModule } from "../auth/refresh-tokens/refresh-tokens.module";
import { RefreshTokensService } from "../auth/refresh-tokens/refresh-tokens.service";
import { ShieldModule } from "../auth/shield/shield.module";
import { shieldPermissions } from "../auth/shield/shield.permissions";
import { ShieldService } from "../auth/shield/shield.service";
import { Environment } from "../common/common.constants";
import { Context, ContextServices } from "../common/common.types";
import { DataloaderModule } from "../dataloader/dataloader.module";
import { DataloaderService } from "../dataloader/dataloader.service";
import { EventsModule } from "../events/events.module";
import { EventsService } from "../events/events.service";
import { GroupMemberRequestsModule } from "../groups/group-member-requests/group-member-requests.module";
import { GroupMemberRequestsService } from "../groups/group-member-requests/group-member-requests.service";
import { GroupRolesModule } from "../groups/group-roles/group-roles.module";
import { GroupRolesService } from "../groups/group-roles/group-roles.service";
import { GroupsModule } from "../groups/groups.module";
import { GroupsService } from "../groups/groups.service";
import { PostsModule } from "../posts/posts.module";
import { PostsService } from "../posts/posts.service";
import { ProposalsModule } from "../proposals/proposals.module";
import { ProposalsService } from "../proposals/proposals.service";
import { UsersModule } from "../users/users.module";
import { UsersService } from "../users/users.service";

export const ApolloModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [
    DataloaderModule,
    EventsModule,
    GroupMemberRequestsModule,
    GroupRolesModule,
    GroupsModule,
    PostsModule,
    ProposalsModule,
    RefreshTokensModule,
    ShieldModule,
    UsersModule,
  ],
  inject: [
    ConfigService,
    DataloaderService,
    EventsService,
    GroupMemberRequestsService,
    GroupRolesService,
    GroupsService,
    PostsService,
    ProposalsService,
    RefreshTokensService,
    ShieldService,
    UsersService,
  ],
  useFactory(
    configService: ConfigService,
    dataloaderService: DataloaderService,
    eventsService: EventsService,
    groupMemberRequestsService: GroupMemberRequestsService,
    groupRolesService: GroupRolesService,
    groupsService: GroupsService,
    postsService: PostsService,
    proposalsService: ProposalsService,
    refreshTokensService: RefreshTokensService,
    shieldService: ShieldService,
    usersService: UsersService
  ) {
    return {
      context: async ({ req }: { req: Request }): Promise<Context> => {
        const claims = getClaims(req);
        const sub = getSub(claims.accessTokenClaims);
        const permissions = sub
          ? await usersService.getUserPermissions(sub)
          : null;
        const user = sub ? await usersService.getUser({ id: sub }) : null;

        const loaders = dataloaderService.getLoaders();
        const services: ContextServices = {
          eventsService,
          groupMemberRequestsService,
          groupRolesService,
          groupsService,
          postsService,
          proposalsService,
          refreshTokensService,
          shieldService,
          usersService,
        };

        return {
          claims,
          loaders,
          permissions,
          services,
          user,
        };
      },
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
