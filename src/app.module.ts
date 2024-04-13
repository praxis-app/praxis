import { MailerModule as MailerModuleDefault } from '@nestjs-modules/mailer';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLSchema } from 'graphql';
import { applyMiddleware } from 'graphql-middleware';
import { GraphQLUpload } from 'graphql-upload-ts';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CanariesModule } from './canaries/canaries.module';
import { CommentsModule } from './comments/comments.module';
import { Environment } from './common/common.constants';
import { ContextModule } from './context/context.module';
import { ContextService } from './context/context.service';
import { DatabaseModule } from './database/database.module';
import { DataloaderModule } from './dataloader/dataloader.module';
import { EventsModule } from './events/events.module';
import { GroupsModule } from './groups/groups.module';
import { ImagesModule } from './images/images.module';
import { LikesModule } from './likes/likes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { ProposalsModule } from './proposals/proposals.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { RulesModule } from './rules/rules.module';
import { ServerConfigsModule } from './server-configs/server-configs.module';
import { ServerInvitesModule } from './server-invites/server-invites.module';
import { ServerRolesModule } from './server-roles/server-roles.module';
import { ShieldModule } from './shield/shield.module';
import { shieldPermissions } from './shield/permissions/shield.permissions';
import { UsersModule } from './users/users.module';
import { VibeCheckModule } from './vibe-check/vibe-check.module';
import { VotesModule } from './votes/votes.module';

const ApolloModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [ContextModule],
  inject: [ConfigService, ContextService],
  useFactory: (
    configService: ConfigService,
    contextService: ContextService,
  ) => ({
    autoSchemaFile: true,
    context: contextService.getContext.bind(contextService),
    csrfPrevention: configService.get('NODE_ENV') !== Environment.Development,
    path: '/api/graphql',
    resolvers: { Upload: GraphQLUpload },
    subscriptions: { 'graphql-ws': { path: '/subscriptions' } },
    transformSchema: (schema: GraphQLSchema) =>
      applyMiddleware(schema, shieldPermissions),
  }),
});

const MailerModule = MailerModuleDefault.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    transport: {
      host: configService.get('MAIL_HOST'),
      port: configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASS'),
      },
    },
  }),
});

const ViewModule = ServeStaticModule.forRoot({
  rootPath: join(__dirname, 'view'),
  exclude: ['/api/(.*)', '/security.txt'],
  renderPath: '/*',
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    ApolloModule,
    AuthModule,
    CanariesModule,
    CommentsModule,
    DatabaseModule,
    DataloaderModule,
    EventsModule,
    GroupsModule,
    ImagesModule,
    LikesModule,
    MailerModule,
    NotificationsModule,
    PostsModule,
    ProposalsModule,
    PubSubModule,
    RulesModule,
    ServerConfigsModule,
    ServerInvitesModule,
    ServerRolesModule,
    ShieldModule,
    UsersModule,
    VibeCheckModule,
    ViewModule,
    VotesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
