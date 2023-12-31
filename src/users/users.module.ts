import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../images/models/image.model';
import { PostsModule } from '../posts/posts.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { ServerRolesModule } from '../server-roles/server-roles.module';
import { User } from './models/user.model';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Image]),
    ServerRolesModule,
    ProposalsModule,
    PostsModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
