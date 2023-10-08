import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups.module';
import { GroupConfigsResolver } from './group-configs.resolver';
import { GroupConfigsService } from './group-configs.service';
import { GroupConfig } from './models/group-config.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupConfig]),
    forwardRef(() => GroupsModule),
  ],
  providers: [GroupConfigsService, GroupConfigsResolver],
  exports: [GroupConfigsService],
})
export class GroupConfigsModule {}
