import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLUpload } from "graphql-upload";
import { AuthModule } from "./auth/auth.module";
import { getClaims, getSub } from "./auth/auth.utils";
import { RefreshTokensModule } from "./auth/refresh-tokens/refresh-tokens.module";
import { RefreshTokensService } from "./auth/refresh-tokens/refresh-tokens.service";
import shieldPermissions from "./auth/shield/shield.permissions";
import { Environments } from "./common/common.constants";
import { Context } from "./common/common.types";
import { DatabaseModule } from "./database/database.module";
import { DataloaderModule } from "./dataloader/dataloader.module";
import { DataloaderService } from "./dataloader/dataloader.service";
import { GroupsModule } from "./groups/groups.module";
import { ImagesModule } from "./images/images.module";
import { PostsModule } from "./posts/posts.module";
import { ProposalsModule } from "./proposals/proposals.module";
import { RolesModule } from "./roles/roles.module";
import { ServerInvitesModule } from "./server-invites/server-invites.module";
import { UsersModule } from "./users/users.module";
import { UsersService } from "./users/users.service";
import { VotesModule } from "./votes/votes.module";

const useFactory = (
  configService: ConfigService,
  dataloaderService: DataloaderService,
  refreshTokensService: RefreshTokensService,
  usersService: UsersService
) => ({
  context: async ({ req }: { req: Request }): Promise<Context> => {
    const claims = getClaims(req);
    const sub = getSub(claims.accessTokenClaims);
    const loaders = dataloaderService.getLoaders();
    const permissions = sub ? await usersService.getUserPermissions(sub) : null;
    const user = sub ? await usersService.getUser({ id: sub }) : null;

    return {
      claims,
      loaders,
      permissions,
      refreshTokensService,
      usersService,
      user,
    };
  },
  transformSchema: (schema: GraphQLSchema) => {
    schema = applyMiddleware(schema, shieldPermissions);
    return schema;
  },
  autoSchemaFile: true,
  cors: { origin: true, credentials: true },
  csrfPrevention: configService.get("NODE_ENV") !== Environments.Development,
  resolvers: { Upload: GraphQLUpload },
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule, RefreshTokensModule, UsersModule],
      inject: [
        ConfigService,
        DataloaderService,
        RefreshTokensService,
        UsersService,
      ],
      useFactory,
    }),
    AuthModule,
    DatabaseModule,
    DataloaderModule,
    GroupsModule,
    ImagesModule,
    PostsModule,
    ProposalsModule,
    RolesModule,
    ServerInvitesModule,
    UsersModule,
    VotesModule,
  ],
})
export class AppModule {}
