import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../models/group.model';
import { GroupConfigsResolver } from './group-configs.resolver';
import { GroupConfigsService } from './group-configs.service';
import { GroupConfig } from './models/group-config.model';

@Module({
  imports: [TypeOrmModule.forFeature([GroupConfig, Group])],
  providers: [GroupConfigsService, GroupConfigsResolver],
  exports: [GroupConfigsService],
})
export class GroupConfigsModule {}
